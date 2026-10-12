// Web Audio API Synthesizer for subtle, distraction-free exam notifications
class ExamAudioService {
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusassess_exam_audio_muted');
        this.muted = stored === 'true';
      } catch {
        this.muted = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('campusassess_exam_audio_muted', muted ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    const next = !this.muted;
    this.setMuted(next);
    return next;
  }

  public playMilestoneAlert(milestone: '50_percent' | '25_percent' | '5_minutes'): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (milestone === '50_percent') {
        // Subtle ascending harmonic chime (C5 523Hz -> E5 659Hz)
        this.playSineTone(ctx, 523.25, now, 0.35, 0.12);
        this.playSineTone(ctx, 659.25, now + 0.18, 0.45, 0.12);
      } else if (milestone === '25_percent') {
        // Attentive dual chime (E5 659Hz -> G5 784Hz)
        this.playSineTone(ctx, 659.25, now, 0.28, 0.14);
        this.playSineTone(ctx, 783.99, now + 0.16, 0.45, 0.14);
      } else if (milestone === '5_minutes') {
        // High-priority 3-pulse chime (E5 -> G5 -> A5)
        this.playSineTone(ctx, 659.25, now, 0.22, 0.15);
        this.playSineTone(ctx, 783.99, now + 0.14, 0.22, 0.15);
        this.playSineTone(ctx, 880.00, now + 0.28, 0.55, 0.18);
      }
    } catch {
      // Audio playback safely ignored if blocked by browser policy
    }
  }

  public playProctorWarning(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low dual warning pulse
      this.playSineTone(ctx, 349.23, now, 0.25, 0.15); // F4
      this.playSineTone(ctx, 293.66, now + 0.16, 0.35, 0.18); // D4
    } catch {
      // safe fallback
    }
  }

  private playSineTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    peakVolume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Smooth ADSR envelope to prevent clicks
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const examAudioService = new ExamAudioService();
