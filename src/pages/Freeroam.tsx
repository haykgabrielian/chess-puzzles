import { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { Square } from 'chess.js';

import ChessBoard from '@/components/board/ChessBoard';
import SolveConfetti from '@/components/board/SolveConfetti';
import Header from '@/components/Header';
import FreeroamInfo from '@/components/sidebar/FreeroamInfo';
import {
  type BoardMove,
  createGame,
  getCapturedPieces,
  getLegalTargetSquares,
  isPromotionMove,
  type PromotionPiece,
  tryMove,
} from '@/helpers/chess';
import { getSideToMove, STARTING_FEN } from '@/helpers/fen';

const MOBILE = '@media (max-width: 900px)';

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
  overflow-x: clip;
`;

const Content = styled.main`
  display: grid;
  grid-template-columns: 1fr min(440px, 40%);
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;
  min-height: calc(100vh - 66px);
  box-sizing: border-box;

  ${MOBILE} {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 16px;
    padding: 12px;
    min-height: auto;
  }
`;

const BoardSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  width: 100%;
`;

const BoardSizer = styled.div`
  position: relative;
  width: min(80vh, 100%);
  aspect-ratio: 1;
  flex-shrink: 0;
`;

const SidebarRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

const getCheckmateWinner = (game: ReturnType<typeof createGame>): 'White' | 'Black' =>
  game.turn() === 'w' ? 'Black' : 'White';

const Freeroam = () => {
  const gameRef = useRef(createGame(STARTING_FEN));
  const [fen, setFen] = useState(STARTING_FEN);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<BoardMove | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<BoardMove | null>(null);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [checkmateWinner, setCheckmateWinner] = useState<'White' | 'Black' | null>(null);

  const resetGame = useCallback(() => {
    gameRef.current = createGame(STARTING_FEN);
    setFen(STARTING_FEN);
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setPendingPromotion(null);
    setIsCheckmate(false);
    setCheckmateWinner(null);
  }, []);

  const applyMove = useCallback(
    (from: string, to: string, promotion?: PromotionPiece) => {
      const game = gameRef.current;
      const move = tryMove(game, from as Square, to as Square, promotion);

      if (!move) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      setFen(game.fen());
      setLastMove({ from: move.from, to: move.to });
      setSelectedSquare(null);
      setLegalTargets([]);
      setPendingPromotion(null);

      if (game.isCheckmate()) {
        setIsCheckmate(true);
        setCheckmateWinner(getCheckmateWinner(game));
      }
    },
    [],
  );

  const onPromotionSelect = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) {
        return;
      }

      const { from, to } = pendingPromotion;
      setPendingPromotion(null);
      applyMove(from, to, promotion);
    },
    [applyMove, pendingPromotion],
  );

  const onSquareClick = useCallback(
    (square: string) => {
      if (isCheckmate) {
        return;
      }

      const game = gameRef.current;

      if (pendingPromotion) {
        if (square === pendingPromotion.to) {
          return;
        }

        setPendingPromotion(null);
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      if (selectedSquare && legalTargets.includes(square)) {
        if (isPromotionMove(game, selectedSquare as Square, square as Square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        applyMove(selectedSquare, square);
        return;
      }

      const piece = game.get(square as Square);

      if (!piece || piece.color !== game.turn()) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      setSelectedSquare(square);
      setLegalTargets(getLegalTargetSquares(game, square as Square));
    },
    [applyMove, isCheckmate, legalTargets, pendingPromotion, selectedSquare],
  );

  const promotionPicker = useMemo(
    () =>
      pendingPromotion
        ? {
            square: pendingPromotion.to,
            color: getSideToMove(fen),
            onSelect: onPromotionSelect,
          }
        : null,
    [fen, onPromotionSelect, pendingPromotion],
  );

  const capturedPieces = useMemo(() => getCapturedPieces(gameRef.current), [fen]);

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Freeroam chess board">
          <BoardSizer>
            <ChessBoard
              fen={fen}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              canInteract={!isCheckmate}
              isSolved={isCheckmate}
              promotionPicker={promotionPicker}
              onSquareClick={onSquareClick}
            />
            <SolveConfetti isSolved={isCheckmate} lastMoveTo={lastMove?.to ?? null} />
          </BoardSizer>
        </BoardSection>
        <SidebarRoot aria-label="Freeroam sidebar">
          <FreeroamInfo
            fen={fen}
            captured={capturedPieces}
            isCheckmate={isCheckmate}
            checkmateWinner={checkmateWinner}
            onReset={resetGame}
          />
        </SidebarRoot>
      </Content>
    </Page>
  );
};

export default Freeroam;
