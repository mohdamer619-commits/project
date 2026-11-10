import { VibrationPatternType, VibrationPreferences, SalahName } from '../types';

export const VIBRATION_PATTERNS: Record<VibrationPatternType, number[]> = {
  standard: [500, 250, 500, 250, 500],
  gentle: [200, 150, 200],
  pulse: [150, 100, 150, 300, 150, 100, 150],
  urgent: [1000, 300, 1000, 300, 1000],
};

export const DEFAULT_VIBRATION: VibrationPreferences = {
  enabled: true,
  pattern: 'standard',
  vibrateBefore: false,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

class VibrationManager {
  /**
   * Check if the device browser supports the Vibration API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Get the millisecond pattern for a pattern key
   */
  public getPattern(type: VibrationPatternType): number[] {
    return VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.standard;
  }

  /**
   * Trigger haptic vibration using Web Vibration API
   */
  public vibrate(patternOrType: VibrationPatternType | number[] = 'standard'): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const pattern = Array.isArray(patternOrType)
        ? patternOrType
        : this.getPattern(patternOrType);
      return navigator.vibrate(pattern);
    } catch (err) {
      console.warn('Vibration API error:', err);
      return false;
    }
  }

  /**
   * Stop any ongoing vibration
   */
  public stop() {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Trigger test vibration pattern
   */
  public test(type: VibrationPatternType = 'standard'): boolean {
    return this.vibrate(type);
  }

  /**
   * Check if vibration should trigger for a specific prayer
   */
  public shouldVibrate(
    prefs: VibrationPreferences | undefined,
    salah: SalahName,
    isAdvanceReminder: boolean = false
  ): boolean {
    if (!prefs || !prefs.enabled) return false;
    if (!prefs.prayers[salah]) return false;
    if (isAdvanceReminder && !prefs.vibrateBefore) return false;
    return true;
  }
}

export const vibrationManager = new VibrationManager();
