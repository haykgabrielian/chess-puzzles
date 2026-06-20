import type { Chess, Move } from 'chess.js';

import { replayGame } from '@/helpers/chess';
import { STARTING_FEN } from '@/helpers/fen';
import { playSound, type SoundKind } from '@/helpers/sounds';

export const getMoveSoundKind = (
  move: Move,
  game: Chess,
  isUserMove: boolean,
): SoundKind => {
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    return 'castle';
  }

  if (move.isCapture() || move.isEnPassant()) {
    return 'capture';
  }

  if (game.inCheck()) {
    return 'check';
  }

  return isUserMove ? 'self' : 'opponent';
};

export const playMoveSound = (
  move: Move,
  game: Chess,
  isUserMove: boolean,
) => {
  playSound(getMoveSoundKind(move, game, isUserMove));
};

export const playAchievementSound = () => {
  playSound('achievement');
};

export const playIncorrectSound = () => {
  playSound('incorrect');
};

export const playFreeroamMoveSound = (move: Move, game: Chess) => {
  if (game.isCheckmate()) {
    playAchievementSound();
    return;
  }

  playMoveSound(move, game, move.color === 'w');
};

export const playHistoryMoveSound = (
  moves: string[],
  ply: number,
  startingFen: string = STARTING_FEN,
) => {
  if (ply <= 0 || ply > moves.length) {
    return;
  }

  const game = replayGame(moves, ply, startingFen);
  const move = game.history({ verbose: true }).at(-1);

  if (!move) {
    return;
  }

  playFreeroamMoveSound(move, game);
};
