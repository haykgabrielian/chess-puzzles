import achievement from '@/assets/sounds/achievement.mp3';
import capture from '@/assets/sounds/capture.mp3';
import castle from '@/assets/sounds/castle.mp3';
import incorrect from '@/assets/sounds/incorrect.mp3';
import moveCheck from '@/assets/sounds/move-check.mp3';
import moveOpponent from '@/assets/sounds/move-opponent.mp3';
import moveSelf from '@/assets/sounds/move-self.mp3';

export type SoundKind =
  | 'self'
  | 'opponent'
  | 'check'
  | 'capture'
  | 'castle'
  | 'achievement'
  | 'incorrect';

const SOUND_SOURCES: Record<SoundKind, string> = {
  self: moveSelf,
  opponent: moveOpponent,
  check: moveCheck,
  capture,
  castle,
  achievement,
  incorrect,
};

const audioByKind = new Map<SoundKind, HTMLAudioElement>();

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

const getAudio = (kind: SoundKind): HTMLAudioElement => {
  let audio = audioByKind.get(kind);

  if (!audio) {
    audio = new Audio(SOUND_SOURCES[kind]);
    audio.preload = 'auto';
    audioByKind.set(kind, audio);
  }

  return audio;
};

export const playSound = (kind: SoundKind) => {
  if (!soundEnabled) {
    return;
  }

  const audio = getAudio(kind);
  audio.currentTime = 0;
  void audio.play().catch(() => {});
};
