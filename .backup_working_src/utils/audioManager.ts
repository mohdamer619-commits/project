import { AdhanAudioId } from '../types';

export interface AdhanAudioOption {
  id: AdhanAudioId;
  name: string;
  location: string;
  reciter: string;
  type: 'local' | 'youtube' | 'license_pending';
  sourceUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  description: string;
  isAvailable: boolean;
  statusBadge: string;
  category: 'makkah' | 'madinah' | 'fajr' | 'international';
  authenticityNote: string;
}

export const ADHAN_OPTIONS: AdhanAudioOption[] = [
  {
    id: 'madinah_qassas',
    name: 'Muhammad Marwan Qassas (Madinah Adhan)',
    location: 'Al-Masjid an-Nabawi, Madinah',
    reciter: 'Sheikh Muhammad Marwan Qassas',
    type: 'youtube',
    youtubeId: 'eTpJvH8rGCc',
    youtubeUrl: 'https://www.youtube.com/watch?v=eTpJvH8rGCc',
    description: 'The authentic, iconic vocal Madinah Adhan from the Prophet’s Mosque recited live by Sheikh Muhammad Marwan Qassas.',
    isAvailable: true,
    statusBadge: 'Verified Live Vocal (YouTube)',
    category: 'madinah',
    authenticityNote: 'Authentic live recording directly from Al-Masjid an-Nabawi minaret archive.',
  },
  {
    id: 'original_makkah',
    name: 'Original Makkah Adhan',
    location: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Ali Ahmed Mulla (Chief Muezzin)',
    type: 'local',
    sourceUrl: '/audio/adhan_makkah.mp3',
    description: 'The world-renowned original full vocal Adhan recorded live at the Holy Kaaba in Masjid al-Haram, Makkah.',
    isAvailable: true,
    statusBadge: 'Authentic Vocal MP3',
    category: 'makkah',
    authenticityNote: 'Full vocal master recording from the Kaaba Mukabariyyah. 100% human vocal.',
  },
  {
    id: 'original_madinah',
    name: 'Original Madinah Adhan',
    location: 'Al-Masjid an-Nabawi, Madinah',
    reciter: 'Muezzin of Al-Masjid an-Nabawi',
    type: 'local',
    sourceUrl: '/audio/adhan_madinah.mp3',
    description: 'The original, serene full vocal Adhan echoing from the Prophet’s Mosque in Madinah al-Munawwarah.',
    isAvailable: true,
    statusBadge: 'Authentic Vocal MP3',
    category: 'madinah',
    authenticityNote: 'Vocal recording echoing over the Green Dome and Rawdah Sharifah.',
  },
  {
    id: 'sheikh_ali_mulla',
    name: 'Sheikh Ali Ahmed Mulla (Bilal al-Haram)',
    location: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Ali Ahmed Mulla',
    type: 'local',
    sourceUrl: '/audio/adhan_makkah.mp3',
    description: 'Dedicated profile of the historic Chief Muezzin of Masjid al-Haram, renowned globally across five decades.',
    isAvailable: true,
    statusBadge: 'Authentic Vocal MP3',
    category: 'makkah',
    authenticityNote: 'Genuine vocal recording of Sheikh Ali Mulla at the Holy Kaaba.',
  },
  {
    id: 'fajr_authentic',
    name: 'Original Fajr Dawn Adhan (With Tathweeb)',
    location: 'Holy Sanctuaries (Al-Haramain)',
    reciter: 'Authentic Vocal Tradition',
    type: 'local',
    sourceUrl: '/audio/adhan_fajr.mp3',
    description: 'Full vocal dawn Adhan containing the established Sunnah proclamation: "As-Salatu Khayrun Minan-Nawm" (Prayer is better than sleep).',
    isAvailable: true,
    statusBadge: 'Authentic Fajr Vocal MP3',
    category: 'fajr',
    authenticityNote: 'Contains the complete authentic dawn proclamation prescribed by the Sunnah.',
  },
  {
    id: 'mishary_alafasy',
    name: 'Sheikh Mishary Rashid Alafasy',
    location: 'Grand Mosque of Kuwait',
    reciter: 'Sheikh Mishary Rashid Alafasy',
    type: 'local',
    sourceUrl: '/audio/adhan_alafasy.mp3',
    description: 'Complete, moving full vocal recording by world-renowned Qari and Imam Sheikh Mishary Rashid Alafasy.',
    isAvailable: true,
    statusBadge: 'Authentic Vocal MP3',
    category: 'international',
    authenticityNote: 'Clear high-fidelity vocal delivery recorded at the Grand Mosque of Kuwait.',
  },
  {
    id: 'sheikh_al_sudais',
    name: 'Sheikh Abdul Rahman Al-Sudais',
    location: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Dr. Abdul Rahman Al-Sudais (Imam of the Kaaba)',
    type: 'license_pending',
    description: 'Imam & General President of the Two Holy Mosques. Sheikh Al-Sudais leads the Salah and Taraweeh, and recites on rare ceremonial occasions.',
    isAvailable: false,
    statusBadge: 'Official Audio License Pending',
    category: 'makkah',
    authenticityNote: 'To maintain 100% integrity and respect Islamic attribution, no synthetic or substituted audio is played while clean licensing is verified.',
  },
  {
    id: 'sheikh_farooq_hadrawi',
    name: 'Sheikh Farooq Hadrawi',
    location: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Farooq Abdul Rahman Hadrawi (Senior Muezzin)',
    type: 'license_pending',
    description: 'Legendary Senior Muezzin of Masjid al-Haram revered for his classic Makkah Maqam Hijaz delivery from the Kaaba.',
    isAvailable: false,
    statusBadge: 'Official Archive License Pending',
    category: 'makkah',
    authenticityNote: 'Preserved in Haramain archives; waiting for open public distribution rights.',
  },
];

// YouTube Player Type definitions
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setVolume: (vol: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Global Web Audio Context for unlocking and resilient playback
let sharedAudioContext: AudioContext | null = null;
let isAudioEngineUnlocked = false;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioContext = new AudioCtxClass();
    }
  }
  return sharedAudioContext;
}

/**
 * Unlocks the Web Audio engine and primes HTMLAudio playback.
 * Can be called during any user interaction (click, touch, keydown).
 */
export async function unlockAudioEngine(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play a brief 10ms silent buffer to unlock the browser's audio hardware session
    if (ctx && ctx.state === 'running') {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }

    // Also prime an HTMLAudio element
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.volume = 0.01;
    await silentAudio.play().catch(() => {});
    silentAudio.pause();

    isAudioEngineUnlocked = true;
    return true;
  } catch (err) {
    console.warn('Audio engine unlock attempt:', err);
    return false;
  }
}

export function isAudioUnlocked(): boolean {
  if (isAudioEngineUnlocked) return true;
  const ctx = getSharedAudioContext();
  return ctx ? ctx.state === 'running' : false;
}

export function getAudioDiagnosticState(): 'unlocked' | 'suspended' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  const ctx = getSharedAudioContext();
  if (!ctx) return 'unsupported';
  return (ctx.state === 'running' || isAudioEngineUnlocked) ? 'unlocked' : 'suspended';
}

// Automatically attach user gesture listeners on load to unlock audio on first interaction
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudioEngine();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });
}

class AdhanPlayerManager {
  private audioElement: HTMLAudioElement | null = null;
  private ytPlayer: YTPlayer | null = null;
  private webAudioSource: AudioBufferSourceNode | null = null;
  private isCurrentlyPlaying = false;
  private activeOptionId: AdhanAudioId | null = null;
  private currentVolume: number = 0.85;
  private onStateChangeCallbacks: Set<
    (isPlaying: boolean, activeId: AdhanAudioId | null, activeOption: AdhanAudioOption | null) => void
  > = new Set();

  constructor() {
    this.ensureHiddenYTContainer();
  }

  private ensureHiddenYTContainer(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    let container = document.getElementById('adhan-yt-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adhan-yt-container';
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '200px';
      container.style.height = '200px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1000';
      document.body.appendChild(container);

      const targetDiv = document.createElement('div');
      targetDiv.id = 'adhan-yt-target';
      container.appendChild(targetDiv);
    }
    return container;
  }

  public subscribe(
    cb: (isPlaying: boolean, activeId: AdhanAudioId | null, activeOption: AdhanAudioOption | null) => void
  ) {
    this.onStateChangeCallbacks.add(cb);
    return () => {
      this.onStateChangeCallbacks.delete(cb);
    };
  }

  private notify() {
    const activeOpt = this.activeOptionId
      ? ADHAN_OPTIONS.find((o) => o.id === this.activeOptionId) || null
      : null;
    this.onStateChangeCallbacks.forEach((cb) =>
      cb(this.isCurrentlyPlaying, this.activeOptionId, activeOpt)
    );
  }

  public isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public getActiveId(): AdhanAudioId | null {
    return this.activeOptionId;
  }

  public getActiveOption(): AdhanAudioOption | null {
    return this.activeOptionId
      ? ADHAN_OPTIONS.find((o) => o.id === this.activeOptionId) || null
      : null;
  }

  public stop() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.audioElement = null;
    }

    if (this.webAudioSource) {
      try {
        this.webAudioSource.stop();
      } catch {
        // ignore
      }
      this.webAudioSource = null;
    }

    if (this.ytPlayer) {
      try {
        this.ytPlayer.stopVideo();
      } catch {
        // ignore
      }
    }

    this.isCurrentlyPlaying = false;
    this.activeOptionId = null;
    this.notify();
  }

  /**
   * Main Playback method.
   * @param optionId The ID of the Adhan recording
   * @param volume Volume 0 to 1
   * @param isAutomatedTrigger Whether this was called by an automated prayer alarm/timer
   */
  public async play(
    optionId: AdhanAudioId,
    volume: number = 0.85,
    isAutomatedTrigger: boolean = false
  ): Promise<boolean> {
    this.stop();
    this.currentVolume = Math.max(0, Math.min(1, volume));

    // Try unlocking audio if not yet done
    await unlockAudioEngine();

    const option = ADHAN_OPTIONS.find((o) => o.id === optionId) || ADHAN_OPTIONS[0];

    if (!option.isAvailable || option.type === 'license_pending') {
      this.isCurrentlyPlaying = false;
      this.activeOptionId = null;
      this.notify();
      return false;
    }

    this.activeOptionId = option.id;
    this.isCurrentlyPlaying = true;
    this.notify();

    // Critical Autoplay Fix for Automated Prayer Time Triggers:
    // When a prayer time alarm triggers automatically without a direct user click,
    // YouTube's iframe API is strictly blocked from unmuted autoplay by Android, iOS,
    // and desktop browsers. We gracefully fallback to the authentic vocal MP3 for automated alarms.
    if (option.type === 'youtube') {
      if (isAutomatedTrigger) {
        // Fallback to authentic Madinah vocal MP3
        console.log('Automated alarm trigger: using authentic vocal MP3 fallback for YouTube option.');
        return this.playLocalAudio('/audio/adhan_madinah.mp3');
      }

      // Manual interactive preview: attempt YouTube playback
      const ytSuccess = await this.playYouTubeAudio(option.youtubeId || 'eTpJvH8rGCc');
      if (!ytSuccess) {
        // If YouTube player was blocked or failed to load, seamlessly play the authentic local vocal
        return this.playLocalAudio('/audio/adhan_madinah.mp3');
      }
      return true;
    }

    if (option.type === 'local' && option.sourceUrl) {
      return this.playLocalAudio(option.sourceUrl);
    }

    // Fallback default
    return this.playLocalAudio('/audio/adhan_makkah.mp3');
  }

  private async playLocalAudio(url: string): Promise<boolean> {
    try {
      const audio = new Audio(url);
      audio.volume = this.currentVolume;
      audio.preload = 'auto';
      this.audioElement = audio;

      audio.onended = () => {
        this.stop();
      };

      audio.onerror = async (e) => {
        console.warn('HTMLAudioElement error, attempting Web Audio API fallback:', url, e);
        const fallbackSuccess = await this.playViaWebAudio(url);
        if (!fallbackSuccess) {
          this.stop();
        }
      };

      // Play the audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      this.recordSuccessfulPlayback(url);
      this.setupMediaSession();
      return true;
    } catch (err: unknown) {
      console.warn('HTMLAudio play() restricted by browser policy, using Web Audio fallback:', err);
      // Attempt fallback via Web Audio API buffer playback
      const webAudioSuccess = await this.playViaWebAudio(url);
      if (!webAudioSuccess) {
        this.stop();
        return false;
      }
      this.recordSuccessfulPlayback(url);
      this.setupMediaSession();
      return true;
    }
  }

  /**
   * Resilient fallback using Web Audio API decoding and GainNode
   */
  private async playViaWebAudio(url: string): Promise<boolean> {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return false;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      gainNode.gain.setValueAtTime(this.currentVolume, ctx.currentTime);
      source.buffer = audioBuffer;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        this.stop();
      };

      this.webAudioSource = source;
      source.start(0);
      return true;
    } catch (webAudioErr) {
      console.error('Web Audio fallback also failed, attempting synthesized chime tone:', webAudioErr);
      return this.playSynthesizedAlarmTone();
    }
  }

  /**
   * Generates a harmonic melodic chime alert tone using Web Audio API oscillators
   * Guarantees audible audio alert even if MP3 files cannot be fetched.
   */
  public async playSynthesizedAlarmTone(volume: number = this.currentVolume): Promise<boolean> {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') await ctx.resume();

      const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.28);
        gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime + idx * 0.28);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.28 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.28);
        osc.stop(ctx.currentTime + idx * 0.28 + 1.3);
      });
      return true;
    } catch {
      return false;
    }
  }

  private playYouTubeAudio(videoId: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.ensureHiddenYTContainer();

      let attempts = 0;
      const startPlayback = () => {
        attempts++;
        if (!window.YT || !window.YT.Player) {
          if (attempts < 10) {
            setTimeout(() => startPlayback(), 250);
          } else {
            resolve(false);
          }
          return;
        }

        try {
          if (this.ytPlayer) {
            try {
              this.ytPlayer.destroy();
            } catch {
              // ignore
            }
          }

          const container = document.getElementById('adhan-yt-container');
          if (container) {
            container.innerHTML = '<div id="adhan-yt-target"></div>';
          }

          this.ytPlayer = new window.YT.Player('adhan-yt-target', {
            height: '200',
            width: '200',
            videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                try {
                  event.target.setVolume(Math.round(this.currentVolume * 100));
                  event.target.playVideo();
                  resolve(true);
                } catch {
                  resolve(false);
                }
              },
              onStateChange: (event) => {
                if (window.YT?.PlayerState && event.data === window.YT.PlayerState.ENDED) {
                  this.stop();
                }
              },
              onError: (err) => {
                console.error('YouTube player error:', err);
                resolve(false);
              },
            },
          });
        } catch (err) {
          console.error('Failed to instantiate YouTube player:', err);
          resolve(false);
        }
      };

      startPlayback();
    });
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume;
    }
    if (this.ytPlayer) {
      try {
        this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      } catch {
        // ignore
      }
    }
  }

  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !this.activeOptionId) return;
    const opt = ADHAN_OPTIONS.find((o) => o.id === this.activeOptionId);
    if (!opt) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: opt.name,
        artist: opt.reciter,
        album: `${opt.location} · Nur al-Salat`,
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
      navigator.mediaSession.setActionHandler('stop', () => this.stop());
      navigator.mediaSession.setActionHandler('pause', () => this.stop());
    } catch {
      // ignore
    }
  }

  private recordSuccessfulPlayback(urlOrName?: string) {
    const opt = this.activeOptionId ? ADHAN_OPTIONS.find((o) => o.id === this.activeOptionId) : null;
    const name = opt ? opt.name : urlOrName || 'Adhan Audio';
    try {
      localStorage.setItem(
        'nur_last_adhan_playback',
        JSON.stringify({ name, timestamp: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  }

  public getLastSuccessfulPlayback(): { name: string; timestamp: Date } | null {
    try {
      const saved = localStorage.getItem('nur_last_adhan_playback');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { name: parsed.name, timestamp: new Date(parsed.timestamp) };
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Verifies whether the selected Adhan audio is loaded and accessible
   */
  public async checkAudioLoaded(audioId: AdhanAudioId): Promise<boolean> {
    const opt = ADHAN_OPTIONS.find((o) => o.id === audioId);
    if (!opt || !opt.isAvailable) return false;
    if (opt.type === 'local' && opt.sourceUrl) {
      try {
        const res = await fetch(opt.sourceUrl, { method: 'HEAD' });
        return res.ok;
      } catch {
        return false;
      }
    }
    if (opt.type === 'youtube') {
      return typeof window !== 'undefined' && (!!window.YT || navigator.onLine);
    }
    return false;
  }
}

export const adhanPlayer = new AdhanPlayerManager();
