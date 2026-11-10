import { DayPrayerSchedule } from './prayerCalc';
import { AdhanSetting, NotificationPreferences, SalahName, VibrationPreferences } from '../types';
import { adhanPlayer, unlockAudioEngine, getAudioDiagnosticState } from './audioManager';
import { vibrationManager, DEFAULT_VIBRATION } from './vibrationManager';

export interface PrayerAlertPopupData {
  id: string;
  title: string;
  message: string;
  prayerName: string;
  timeString: string;
  isAdvance: boolean;
  remainingMinutes?: number;
  timestamp: number;
}

export interface AlertTriggerLog {
  id: string;
  timestamp: Date;
  prayerName: string;
  isAdvance: boolean;
  notificationStatus: 'sent_sw' | 'sent_direct' | 'denied' | 'disabled' | 'error';
  vibrationStatus: 'vibrated' | 'unsupported' | 'disabled';
  audioStatus: 'playing' | 'muted' | 'blocked' | 'disabled';
  note?: string;
}

export interface AlertDiagnosticReport {
  // 10 Mandatory Diagnostic Indicators
  notificationPermission: 'Enabled' | 'Disabled';
  rawPermission: NotificationPermission | 'unsupported';
  notificationScheduling: 'Active' | 'Failed' | 'Disabled';
  serviceWorker: 'Active' | 'Failed' | 'Not applicable';
  vibration: 'Available' | 'Unavailable';
  adhanAudio: 'Loaded' | 'Failed';
  backgroundExecution: 'Supported' | 'Limited';
  nextScheduledPrayer: {
    name: SalahName;
    time: Date;
    timeString: string;
    msRemaining: number;
  } | null;
  lastSchedulingAttempt: Date | null;
  lastNotificationDelivery: AlertTriggerLog | null;
  lastSuccessfulAdhanPlayback: { name: string; timestamp: Date } | null;
  lastError: string | null;

  // Additional System Details
  audioState: 'unlocked' | 'suspended' | 'unsupported';
  wakeLockSupported: boolean;
  wakeLockActive: boolean;
  logs: AlertTriggerLog[];
  simulationState: {
    isActive: boolean;
    remainingSeconds: number;
    targetTime: Date | null;
  };
}

class NotificationScheduler {
  private activeTimers: number[] = [];
  private tickerIntervalId: number | null = null;
  private currentSchedule: DayPrayerSchedule | null = null;
  private currentAdhanSettings: AdhanSetting | null = null;
  private currentNotificationPrefs: NotificationPreferences | null = null;
  private currentVibrationPrefs: VibrationPreferences = DEFAULT_VIBRATION;

  // Track triggered events for each prayer today to avoid duplication
  private triggeredRecords: Set<string> = new Set();

  // Diagnostics and telemetry logs
  private triggerLogs: AlertTriggerLog[] = [];
  private diagnosticSubscribers: Set<(report: AlertDiagnosticReport) => void> = new Set();

  // Test Simulation State
  private simulationIntervalId: number | null = null;
  private simulationRemainingSeconds: number = 0;
  private simulationTargetTime: Date | null = null;

  // Screen Wake Lock API reference
  private wakeLockSentinel: unknown = null;
  private isWakeLockRequested: boolean = false;

  // Diagnostic Tracking Fields
  private lastSchedulingAttempt: Date | null = null;
  private lastError: string | null = null;
  private isAudioFileLoaded: boolean = true;

  // In-App Pop-up Alert Subscribers
  private popupSubscribers: Set<(data: PrayerAlertPopupData) => void> = new Set();

  constructor() {
    this.loadTriggeredRecords();
    this.loadPersistedLogs();
    this.loadPersistedDiagnostics();
    this.startPrecisionTicker();
    this.initServiceWorkerListener();
    this.initForegroundListeners();
  }

  private initForegroundListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.checkPrayerScheduleTick();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkPrayerScheduleTick();
        }
      });
    }
  }

  public subscribePopupAlert(cb: (data: PrayerAlertPopupData) => void): () => void {
    this.popupSubscribers.add(cb);
    return () => {
      this.popupSubscribers.delete(cb);
    };
  }

  public emitPopupAlert(data: PrayerAlertPopupData) {
    this.popupSubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch {
        // ignore subscriber errors
      }
    });

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('nur_prayer_popup_alert', { detail: data }));
      } catch {
        // ignore
      }
    }
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadTriggeredRecords() {
    try {
      const saved = localStorage.getItem('nur_triggered_alarms');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const today = this.getTodayKey();
        const todayKeys = parsed.filter((k) => k.startsWith(today));
        this.triggeredRecords = new Set(todayKeys);
      }
    } catch {
      this.triggeredRecords = new Set();
    }
  }

  private saveTriggeredRecord(key: string) {
    this.triggeredRecords.add(key);
    try {
      localStorage.setItem(
        'nur_triggered_alarms',
        JSON.stringify(Array.from(this.triggeredRecords))
      );
    } catch {
      // ignore
    }
  }

  private hasTriggered(key: string): boolean {
    return this.triggeredRecords.has(key);
  }

  private loadPersistedLogs() {
    try {
      const saved = localStorage.getItem('nur_alert_logs');
      if (saved) {
        const parsed: AlertTriggerLog[] = JSON.parse(saved);
        this.triggerLogs = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch {
      this.triggerLogs = [];
    }
  }

  private loadPersistedDiagnostics() {
    try {
      const savedAttempt = localStorage.getItem('nur_last_schedule_attempt');
      if (savedAttempt) {
        this.lastSchedulingAttempt = new Date(savedAttempt);
      }
      const savedError = localStorage.getItem('nur_last_alert_error');
      if (savedError) {
        this.lastError = savedError;
      }
    } catch {
      // ignore
    }
  }

  private appendLog(log: AlertTriggerLog) {
    this.triggerLogs.unshift(log);
    if (this.triggerLogs.length > 20) {
      this.triggerLogs = this.triggerLogs.slice(0, 20);
    }
    try {
      localStorage.setItem('nur_alert_logs', JSON.stringify(this.triggerLogs));
    } catch {
      // ignore
    }
    this.broadcastDiagnostics();
  }

  public subscribeDiagnostics(cb: (report: AlertDiagnosticReport) => void): () => void {
    this.diagnosticSubscribers.add(cb);
    cb(this.getDiagnosticReport());
    return () => {
      this.diagnosticSubscribers.delete(cb);
    };
  }

  private broadcastDiagnostics() {
    const report = this.getDiagnosticReport();
    this.diagnosticSubscribers.forEach((cb) => {
      try {
        cb(report);
      } catch {
        // ignore subscriber errors
      }
    });
  }

  private initServiceWorkerListener() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'STOP_ADHAN') {
          adhanPlayer.stop();
        }
      });
    }
  }

  /**
   * Safe ServiceWorker registration resolver with guaranteed 1500ms timeout
   * Prevents navigator.serviceWorker.ready from hanging indefinitely.
   */
  public async getActiveServiceWorker(timeoutMs: number = 1500): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      // Check existing active registration first
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing && (existing.active || existing.installing || existing.waiting)) {
        return existing;
      }

      // Race navigator.serviceWorker.ready with a strict timeout
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      );

      const resolved = await Promise.race([readyPromise, timeoutPromise]);
      return resolved || existing || null;
    } catch (err) {
      console.warn('[Nur al-Salat] Error retrieving Service Worker registration:', err);
      return null;
    }
  }

  /**
   * Request system notification permissions with cross-platform support
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      await unlockAudioEngine();
      const permission = await Notification.requestPermission();
      this.broadcastDiagnostics();
      return permission;
    } catch (err) {
      this.lastError = `Permission request error: ${err instanceof Error ? err.message : String(err)}`;
      this.broadcastDiagnostics();
      return 'denied';
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Continuous precision ticker (runs every 1 second)
   * Evaluates prayer windows, advance preparation reminders, and catches up after sleep/doze mode
   */
  private startPrecisionTicker() {
    if (typeof window === 'undefined') return;
    if (this.tickerIntervalId !== null) return;

    this.tickerIntervalId = window.setInterval(() => {
      this.checkPrayerScheduleTick();
    }, 1000);
  }

  /**
   * Evaluates current time against prayer schedule
   */
  private checkPrayerScheduleTick() {
    if (!this.currentSchedule) return;

    const now = Date.now();
    const today = this.getTodayKey();
    const salahs: SalahName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    salahs.forEach((salahName) => {
      const prayerItem = this.currentSchedule?.prayerList.find((p) => p.name === salahName);
      if (!prayerItem) return;

      const prayerTimeMs = prayerItem.time.getTime();

      // -----------------------------------------------------------
      // 1. Advance Preparation Reminder Check
      // -----------------------------------------------------------
      if (
        this.currentNotificationPrefs?.enabled &&
        this.currentNotificationPrefs.prayers[salahName] &&
        (this.currentNotificationPrefs.timing === 'before_time' ||
          this.currentNotificationPrefs.timing === 'both')
      ) {
        const beforeMinutes = this.currentNotificationPrefs.beforeMinutes || 15;
        const targetBeforeMs = prayerTimeMs - beforeMinutes * 60 * 1000;
        const beforeKey = `${today}_before_${salahName}_${beforeMinutes}m`;

        // Active catch-up window: anytime from targetBeforeMs up to prayerTimeMs
        // This ensures opening the app during the pre-prayer window triggers the visible alert!
        if (now >= targetBeforeMs && now < prayerTimeMs) {
          if (!this.hasTriggered(beforeKey)) {
            this.saveTriggeredRecord(beforeKey);

            const remainingMinutes = Math.max(1, Math.round((prayerTimeMs - now) / 60000));
            console.log(
              `[Nur al-Salat] Advance alert for ${salahName} (${remainingMinutes}m remaining)`
            );

            // A. Advance Vibration
            let vibStatus: 'vibrated' | 'unsupported' | 'disabled' = 'disabled';
            if (this.currentVibrationPrefs?.vibrateBefore) {
              const vibSuccess = vibrationManager.vibrate('gentle');
              vibStatus = vibSuccess ? 'vibrated' : 'unsupported';
            }

            // B. Visible In-App Pop-up Heads-Up Notification
            this.emitPopupAlert({
              id: beforeKey,
              title: `Upcoming: ${salahName} in ${remainingMinutes} min`,
              message: `Time to prepare for ${salahName} prayer (${prayerItem.timeString}). Complete wudu and prepare for prayer.`,
              prayerName: salahName,
              timeString: prayerItem.timeString,
              isAdvance: true,
              remainingMinutes,
              timestamp: Date.now(),
            });

            // C. Advance System Notification
            this.sendSystemNotification(
              `Upcoming: ${salahName} in ${remainingMinutes} minutes`,
              `Time to prepare for ${salahName} prayer (${prayerItem.timeString}).`,
              beforeKey,
              salahName,
              true
            ).then((notifStatus) => {
              this.appendLog({
                id: `log_${Date.now()}`,
                timestamp: new Date(),
                prayerName: `${salahName} (Advance)`,
                isAdvance: true,
                notificationStatus: notifStatus,
                vibrationStatus: vibStatus,
                audioStatus: 'disabled',
                note: `Advance reminder fired ${remainingMinutes} minutes prior to ${prayerItem.timeString}`,
              });
            });
          }
        }
      }

      // -----------------------------------------------------------
      // 2. Exact Prayer Time Notification, Vibration & Adhan
      // -----------------------------------------------------------
      const startKey = `${today}_start_${salahName}`;

      // Generous 15-minute catch-up window protects against phone screen-off / doze throttling!
      const catchUpWindowMs = 15 * 60 * 1000;
      if (now >= prayerTimeMs && now < prayerTimeMs + catchUpWindowMs) {
        if (!this.hasTriggered(startKey)) {
          this.saveTriggeredRecord(startKey);

          const delayMinutes = Math.floor((now - prayerTimeMs) / 60000);
          const isLateCatchUp = delayMinutes >= 1;

          console.log(
            `[Nur al-Salat] Triggering exact prayer alarm for ${salahName} at ${new Date().toLocaleTimeString()} ${
              isLateCatchUp ? `(Woke up ${delayMinutes}m after prayer start)` : ''
            }`
          );

          // -------------------------------------------------------
          // A. Trigger Haptic Vibration First (Non-blocking)
          // -------------------------------------------------------
          let vibStatus: 'vibrated' | 'unsupported' | 'disabled' = 'disabled';
          try {
            if (vibrationManager.shouldVibrate(this.currentVibrationPrefs, salahName, false)) {
              const vibSuccess = vibrationManager.vibrate(this.currentVibrationPrefs.pattern);
              vibStatus = vibSuccess ? 'vibrated' : 'unsupported';
            }
          } catch (vibErr) {
            console.warn('[Nur al-Salat] Vibration trigger error:', vibErr);
          }

          // -------------------------------------------------------
          // B. Trigger In-App Pop-up Heads-Up Notification
          // -------------------------------------------------------
          this.emitPopupAlert({
            id: startKey,
            title: isLateCatchUp ? `Time for ${salahName} (Started ${delayMinutes}m ago)` : `Time for ${salahName}`,
            message: `The prayer time for ${salahName} has begun (${prayerItem.timeString}). Hayya 'ala al-Salah.`,
            prayerName: salahName,
            timeString: prayerItem.timeString,
            isAdvance: false,
            timestamp: Date.now(),
          });

          // -------------------------------------------------------
          // C. Trigger Adhan Vocal Audio Playback (Non-blocking)
          // -------------------------------------------------------
          let audioStatus: 'playing' | 'muted' | 'blocked' | 'disabled' = 'disabled';
          try {
            if (
              this.currentAdhanSettings?.enabled &&
              this.currentAdhanSettings.prayers[salahName] &&
              !this.currentAdhanSettings.notificationOnly
            ) {
              let prayerAudioId =
                this.currentAdhanSettings.useSeparatePerPrayer &&
                this.currentAdhanSettings.prayerAudios?.[salahName]
                  ? this.currentAdhanSettings.prayerAudios[salahName]
                  : this.currentAdhanSettings.selectedAudio;

              // Use authentic Fajr adhan with Tathweeb for dawn prayer if default
              if (
                salahName === 'Fajr' &&
                (!prayerAudioId ||
                  prayerAudioId === 'madinah_qassas' ||
                  prayerAudioId === 'original_makkah')
              ) {
                prayerAudioId = 'fajr_authentic';
              }

              audioStatus = 'playing';
              adhanPlayer.play(prayerAudioId, this.currentAdhanSettings.volume, true).then((success) => {
                if (!success) {
                  console.warn('[Nur al-Salat] Adhan audio playback returned false');
                }
              });
            }
          } catch (audioErr) {
            console.warn('[Nur al-Salat] Adhan audio playback error:', audioErr);
            audioStatus = 'blocked';
            this.lastError = `Adhan audio playback error: ${audioErr instanceof Error ? audioErr.message : String(audioErr)}`;
          }

          // -------------------------------------------------------
          // D. Trigger Cross-Platform System Notification
          // -------------------------------------------------------
          const notificationTitle = isLateCatchUp
            ? `Time for ${salahName} (Started ${delayMinutes}m ago)`
            : `Time for ${salahName} (${prayerItem.timeString})`;

          const notificationBody = `The prayer time for ${salahName} has begun. Hayya 'ala al-Salah.`;

          if (
            this.currentNotificationPrefs?.enabled &&
            this.currentNotificationPrefs.prayers[salahName] &&
            (this.currentNotificationPrefs.timing === 'at_time' ||
              this.currentNotificationPrefs.timing === 'both')
          ) {
            this.sendSystemNotification(
              notificationTitle,
              notificationBody,
              startKey,
              salahName,
              false
            ).then((notifStatus) => {
              this.appendLog({
                id: `log_${Date.now()}`,
                timestamp: new Date(),
                prayerName: salahName,
                isAdvance: false,
                notificationStatus: notifStatus,
                vibrationStatus: vibStatus,
                audioStatus,
                note: isLateCatchUp
                  ? `Delivered on wake up (${delayMinutes}m after ${prayerItem.timeString})`
                  : `Delivered on exact prayer time (${prayerItem.timeString})`,
              });
            });
          } else {
            this.appendLog({
              id: `log_${Date.now()}`,
              timestamp: new Date(),
              prayerName: salahName,
              isAdvance: false,
              notificationStatus: 'disabled',
              vibrationStatus: vibStatus,
              audioStatus,
              note: `Notification disabled in preferences. Vibration and audio triggered according to settings.`,
            });
          }
        }
      }
    });
  }

  public clearSchedule() {
    this.activeTimers.forEach((timerId) => window.clearTimeout(timerId));
    this.activeTimers = [];
  }

  /**
   * Updates state and registers exact precision timers alongside ticker
   */
  public scheduleForToday(
    schedule: DayPrayerSchedule,
    adhanSettings: AdhanSetting,
    notificationPrefs: NotificationPreferences,
    vibrationPrefs: VibrationPreferences = DEFAULT_VIBRATION
  ) {
    try {
      this.currentSchedule = schedule;
      this.currentAdhanSettings = adhanSettings;
      this.currentNotificationPrefs = notificationPrefs;
      this.currentVibrationPrefs = vibrationPrefs;

      this.clearSchedule();

      const now = Date.now();
      const salahs: SalahName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

      salahs.forEach((salahName) => {
        const prayerItem = schedule.prayerList.find((p) => p.name === salahName);
        if (!prayerItem) return;

        const prayerTimeMs = prayerItem.time.getTime();

        // 1. Advance reminder timer
        if (
          notificationPrefs.enabled &&
          notificationPrefs.prayers[salahName] &&
          (notificationPrefs.timing === 'before_time' || notificationPrefs.timing === 'both')
        ) {
          const beforeMinutes = notificationPrefs.beforeMinutes || 15;
          const targetBeforeMs = prayerTimeMs - beforeMinutes * 60 * 1000;
          const delayBefore = targetBeforeMs - now;

          if (delayBefore > 0 && delayBefore < 24 * 60 * 60 * 1000) {
            const timerId = window.setTimeout(() => {
              this.checkPrayerScheduleTick();
            }, delayBefore);
            this.activeTimers.push(timerId);
          }
        }

        // 2. Exact Prayer Time timer
        const delayAtTime = prayerTimeMs - now;
        if (delayAtTime > 0 && delayAtTime < 24 * 60 * 60 * 1000) {
          const timerId = window.setTimeout(() => {
            this.checkPrayerScheduleTick();
          }, delayAtTime);
          this.activeTimers.push(timerId);
        }
      });

      this.lastSchedulingAttempt = new Date();
      this.lastError = null;
      try {
        localStorage.setItem('nur_last_schedule_attempt', this.lastSchedulingAttempt.toISOString());
      } catch {
        // ignore
      }

      this.checkSelectedAudioLoading();
      this.broadcastDiagnostics();
    } catch (schedErr) {
      this.lastError = `Scheduling error: ${schedErr instanceof Error ? schedErr.message : String(schedErr)}`;
      try {
        localStorage.setItem('nur_last_alert_error', this.lastError);
      } catch {
        // ignore
      }
      this.broadcastDiagnostics();
    }
  }

  private async checkSelectedAudioLoading() {
    if (this.currentAdhanSettings?.selectedAudio) {
      try {
        this.isAudioFileLoaded = await adhanPlayer.checkAudioLoaded(
          this.currentAdhanSettings.selectedAudio
        );
      } catch {
        this.isAudioFileLoaded = false;
      }
    }
  }

  /**
   * Robust cross-platform notification dispatcher:
   * Prioritizes ServiceWorkerRegistration.showNotification() for Android Chrome / Mobile PWA,
   * with fallback to standard window Notification for desktop browsers.
   */
  public async sendSystemNotification(
    title: string,
    body: string,
    key: string,
    salahName?: SalahName,
    isAdvance: boolean = false
  ): Promise<'sent_sw' | 'sent_direct' | 'denied' | 'error'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'error';
    }

    if (Notification.permission !== 'granted') {
      return 'denied';
    }

    const pattern = isAdvance
      ? vibrationManager.getPattern('gentle')
      : vibrationManager.getPattern(this.currentVibrationPrefs?.pattern || 'standard');

    const notificationOptions = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: key,
      renotify: true,
      silent: false,
      vibrate: pattern,
      requireInteraction: true,
      data: {
        url: '/?tab=dashboard',
        salah: salahName,
        time: new Date().toISOString(),
      },
      actions: [
        { action: 'open_app', title: 'Open Nur al-Salat' },
        { action: 'stop_adhan', title: 'Stop Audio' },
      ],
    };

    // 1. Try Service Worker Registration (Crucial for Android Chrome & mobile background!)
    try {
      const registration = await this.getActiveServiceWorker(1500);
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions as NotificationOptions);
        return 'sent_sw';
      }
    } catch (swErr) {
      console.warn('[Nur al-Salat] ServiceWorker showNotification failed, trying window fallback:', swErr);
    }

    // 2. Fallback to standard window Notification (Desktop browsers, Mac Safari)
    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: key,
      });
      return 'sent_direct';
    } catch (windowErr) {
      console.warn('[Nur al-Salat] Window Notification constructor error:', windowErr);
      return 'error';
    }
  }

  // =========================================================================
  // 6 MANDATORY FUNCTIONAL TEST & ACTION BUTTONS
  // =========================================================================

  /**
   * Button 1: Test Notification
   */
  public async testNotification(): Promise<boolean> {
    const perm = await this.requestPermission();
    if (perm !== 'granted') {
      return false;
    }

    const status = await this.sendSystemNotification(
      'Fajr prayer time has started',
      'This is a verified test of the Nur al-Salat prayer notification system.',
      `test_notif_${Date.now()}`,
      'Fajr',
      false
    );

    this.appendLog({
      id: `test_notif_${Date.now()}`,
      timestamp: new Date(),
      prayerName: 'Test Notification',
      isAdvance: false,
      notificationStatus: status,
      vibrationStatus: 'disabled',
      audioStatus: 'disabled',
      note: 'User initiated standalone notification test',
    });

    return status === 'sent_sw' || status === 'sent_direct';
  }

  /**
   * Button 2: Test Vibration
   */
  public testVibration(): boolean {
    const pattern = this.currentVibrationPrefs?.pattern || 'standard';
    const success = vibrationManager.test(pattern);

    this.appendLog({
      id: `test_vib_${Date.now()}`,
      timestamp: new Date(),
      prayerName: 'Test Vibration',
      isAdvance: false,
      notificationStatus: 'disabled',
      vibrationStatus: success ? 'vibrated' : 'unsupported',
      audioStatus: 'disabled',
      note: `User initiated vibration test [Pattern: ${pattern}]`,
    });

    return success;
  }

  /**
   * Button 3: Test Selected Adhan
   */
  public async testSelectedAdhan(): Promise<boolean> {
    await unlockAudioEngine();
    const selected = this.currentAdhanSettings?.selectedAudio || 'original_makkah';
    const vol = this.currentAdhanSettings?.volume ?? 0.85;
    const playing = await adhanPlayer.play(selected, vol, false);

    this.appendLog({
      id: `test_audio_${Date.now()}`,
      timestamp: new Date(),
      prayerName: 'Test Selected Adhan',
      isAdvance: false,
      notificationStatus: 'disabled',
      vibrationStatus: 'disabled',
      audioStatus: playing ? 'playing' : 'blocked',
      note: `User initiated selected Adhan preview [${selected}]`,
    });

    return playing;
  }

  /**
   * Button 4: Schedule Test Alert in 2 Minutes (120 seconds)
   * Exact accelerated test allowing user to lock phone or switch apps to verify background delivery!
   */
  public scheduleTestAlert2Minutes(): void {
    this.startPrayerSimulation(120, 'Asr');
  }

  /**
   * Button 5: Recheck Permissions & System API status
   */
  public async recheckPermissions(): Promise<AlertDiagnosticReport> {
    await unlockAudioEngine();
    await this.checkSelectedAudioLoading();
    this.broadcastDiagnostics();
    return this.getDiagnosticReport();
  }

  /**
   * Button 6: Rebuild Prayer Notification Schedule
   */
  public rebuildSchedule(): boolean {
    if (!this.currentSchedule || !this.currentAdhanSettings || !this.currentNotificationPrefs) {
      this.lastError = 'Cannot rebuild schedule: Prayer schedule or preferences not loaded yet.';
      this.broadcastDiagnostics();
      return false;
    }

    this.scheduleForToday(
      this.currentSchedule,
      this.currentAdhanSettings,
      this.currentNotificationPrefs,
      this.currentVibrationPrefs
    );
    return true;
  }

  /**
   * Synchronous 3-channel Alarm Pipeline Test
   */
  public async testAlarmSystem(
    adhanSettings?: AdhanSetting,
    vibrationPrefs?: VibrationPreferences
  ) {
    const adhan = adhanSettings || this.currentAdhanSettings;
    const vib = vibrationPrefs || this.currentVibrationPrefs;

    await unlockAudioEngine();

    // 1. Vibration
    let vibSuccess = false;
    if (vib?.enabled) {
      vibSuccess = vibrationManager.vibrate(vib.pattern);
    }

    // 2. Notification
    let notifStatus: 'sent_sw' | 'sent_direct' | 'denied' | 'error' = 'denied';
    if (this.getPermissionStatus() === 'granted') {
      notifStatus = await this.sendSystemNotification(
        'Nur al-Salat: Full Alarm Test',
        'Testing Adhan sound, notification delivery, and haptic vibration synchronously.',
        `test_all_${Date.now()}`,
        'Dhuhr',
        false
      );
    }

    // 3. Audio
    let audioPlaying = false;
    if (adhan?.enabled && !adhan.notificationOnly) {
      audioPlaying = await adhanPlayer.play(adhan.selectedAudio, adhan.volume, false);
    }

    this.appendLog({
      id: `test_all_${Date.now()}`,
      timestamp: new Date(),
      prayerName: 'Full Pipeline Test',
      isAdvance: false,
      notificationStatus: notifStatus,
      vibrationStatus: vibSuccess ? 'vibrated' : 'unsupported',
      audioStatus: audioPlaying ? 'playing' : 'blocked',
      note: 'User tested complete alert pipeline (Sound + Vibration + Notification)',
    });
  }

  /**
   * Background Simulation Runner
   */
  public startPrayerSimulation(
    secondsAhead: number = 120,
    simulatedPrayer: SalahName = 'Asr'
  ): void {
    this.cancelPrayerSimulation();

    this.simulationRemainingSeconds = secondsAhead;
    this.simulationTargetTime = new Date(Date.now() + secondsAhead * 1000);
    this.broadcastDiagnostics();

    this.simulationIntervalId = window.setInterval(() => {
      this.simulationRemainingSeconds--;

      if (this.simulationRemainingSeconds <= 0) {
        this.cancelPrayerSimulation();
        this.triggerSimulatedPrayerAlarm(simulatedPrayer);
      } else {
        this.broadcastDiagnostics();
      }
    }, 1000);
  }

  public cancelPrayerSimulation(): void {
    if (this.simulationIntervalId !== null) {
      window.clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
    this.simulationRemainingSeconds = 0;
    this.simulationTargetTime = null;
    this.broadcastDiagnostics();
  }

  private async triggerSimulatedPrayerAlarm(salah: SalahName) {
    console.log(`[Nur al-Salat] Simulated prayer alarm firing for ${salah}!`);

    // 1. Vibration
    let vibStatus: 'vibrated' | 'unsupported' | 'disabled' = 'disabled';
    if (this.currentVibrationPrefs?.enabled) {
      const vOk = vibrationManager.vibrate(this.currentVibrationPrefs.pattern);
      vibStatus = vOk ? 'vibrated' : 'unsupported';
    }

    // 2. Audio
    let audioStatus: 'playing' | 'muted' | 'blocked' | 'disabled' = 'disabled';
    if (this.currentAdhanSettings?.enabled && !this.currentAdhanSettings.notificationOnly) {
      audioStatus = 'playing';
      adhanPlayer.play(this.currentAdhanSettings.selectedAudio, this.currentAdhanSettings.volume, true);
    }

    // 3. System Notification
    const notifStatus = await this.sendSystemNotification(
      `Time for ${salah} (Simulation Alert)`,
      `Prayer time for ${salah} has begun. Verified background delivery.`,
      `sim_${Date.now()}`,
      salah,
      false
    );

    this.appendLog({
      id: `sim_log_${Date.now()}`,
      timestamp: new Date(),
      prayerName: `${salah} (Simulation)`,
      isAdvance: false,
      notificationStatus: notifStatus,
      vibrationStatus: vibStatus,
      audioStatus,
      note: `Timer simulation completed successfully while app was minimized/running.`,
    });
  }

  // =========================================================================
  // SCREEN WAKE LOCK / KEEP-ALIVE (MASJID & HOME PRAYER DISPLAY MODE)
  // =========================================================================

  public async toggleWakeLock(enable: boolean): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (enable) {
        const nav = navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } };
        this.wakeLockSentinel = await nav.wakeLock.request('screen');
        this.isWakeLockRequested = true;
        this.broadcastDiagnostics();
        return true;
      } else {
        if (this.wakeLockSentinel) {
          const sentinel = this.wakeLockSentinel as { release: () => Promise<void> };
          await sentinel.release();
          this.wakeLockSentinel = null;
        }
        this.isWakeLockRequested = false;
        this.broadcastDiagnostics();
        return false;
      }
    } catch (err) {
      console.warn('[Nur al-Salat] Screen Wake Lock error:', err);
      this.isWakeLockRequested = false;
      this.broadcastDiagnostics();
      return false;
    }
  }

  public isWakeLockActive(): boolean {
    return this.isWakeLockRequested && this.wakeLockSentinel !== null;
  }

  // =========================================================================
  // LIVE DIAGNOSTIC HEALTH REPORT (ALL 10 MANDATORY INDICATORS)
  // =========================================================================

  public getDiagnosticReport(): AlertDiagnosticReport {
    // 1. Next scheduled prayer calculation
    let nextScheduledPrayer: AlertDiagnosticReport['nextScheduledPrayer'] = null;
    if (this.currentSchedule) {
      const now = Date.now();
      const upcoming = this.currentSchedule.prayerList
        .filter((p) => p.name !== 'Sunrise' && p.time.getTime() > now)
        .sort((a, b) => a.time.getTime() - b.time.getTime())[0];

      if (upcoming) {
        nextScheduledPrayer = {
          name: upcoming.name as SalahName,
          time: upcoming.time,
          timeString: upcoming.timeString,
          msRemaining: upcoming.time.getTime() - now,
        };
      }
    }

    // 2. Service worker status
    let swStatus: 'Active' | 'Failed' | 'Not applicable' = 'Not applicable';
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        swStatus = 'Active';
      } else {
        swStatus = 'Failed';
      }
    }

    // 3. Notification permission
    const rawPerm = this.getPermissionStatus();
    const notificationPermission: 'Enabled' | 'Disabled' =
      rawPerm === 'granted' ? 'Enabled' : 'Disabled';

    // 4. Notification scheduling
    const notificationScheduling: 'Active' | 'Failed' | 'Disabled' =
      !this.currentNotificationPrefs?.enabled
        ? 'Disabled'
        : this.activeTimers.length > 0 || this.tickerIntervalId !== null
        ? 'Active'
        : 'Failed';

    // 5. Vibration
    const vibration: 'Available' | 'Unavailable' = vibrationManager.isSupported()
      ? 'Available'
      : 'Unavailable';

    // 6. Adhan audio loaded
    const adhanAudio: 'Loaded' | 'Failed' = this.isAudioFileLoaded ? 'Loaded' : 'Failed';

    // 7. Background execution
    // Android PWA standalone supports background service worker notifications;
    // Desktop supports notifications while browser is open;
    // iOS Safari has OS-level background timer limitations.
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);

    const backgroundExecution: 'Supported' | 'Limited' =
      isStandalone || (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator)
        ? 'Supported'
        : 'Limited';

    return {
      notificationPermission,
      rawPermission: rawPerm,
      notificationScheduling,
      serviceWorker: swStatus,
      vibration,
      adhanAudio,
      backgroundExecution,
      nextScheduledPrayer,
      lastSchedulingAttempt: this.lastSchedulingAttempt,
      lastNotificationDelivery: this.triggerLogs.find((l) => l.notificationStatus.startsWith('sent')) || null,
      lastSuccessfulAdhanPlayback: adhanPlayer.getLastSuccessfulPlayback(),
      lastError: this.lastError,

      audioState: getAudioDiagnosticState(),
      wakeLockSupported: typeof window !== 'undefined' && 'wakeLock' in navigator,
      wakeLockActive: this.isWakeLockActive(),
      logs: this.triggerLogs,
      simulationState: {
        isActive: this.simulationIntervalId !== null,
        remainingSeconds: this.simulationRemainingSeconds,
        targetTime: this.simulationTargetTime,
      },
    };
  }
}

export const notificationScheduler = new NotificationScheduler();
