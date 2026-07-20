import { Fragment, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import Card from '@/components/ui/Card';
import type { HistoryRowKind, MoveHistoryRow } from '@/helpers/chess';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin: -14px;
`;

const ScrollArea = styled.div`
  max-height: min(360px, 48vh);
  overflow-y: auto;
  overscroll-behavior: contain;

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.border} transparent`};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${({ theme }) => theme.button.background};
  box-shadow: 0 1px 0 ${({ theme }) => theme.border};
`;

const HeaderCell = styled.th<{ $align?: 'left' | 'center' }>`
  padding: 9px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
  text-align: ${({ $align = 'center' }) => $align};

  &:first-child {
    width: 52px;
    padding-left: 16px;
  }

  &:last-child {
    padding-right: 16px;
  }
`;

const BodyRow = styled.tr<{
  $active?: boolean;
  $variation?: boolean;
}>`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  ${({ $active, theme }) =>
    $active &&
    css`
      background-color: ${theme.accentMuted};
    `}

  ${({ $variation, theme }) =>
    $variation &&
    css`
      background-color: ${theme.variationMuted};

      &:not(:last-child) {
        border-bottom-color: ${theme.variation}1f;
      }

      td:first-child {
        position: relative;
        padding-left: 22px;
      }

      td:first-child::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 3px;
        background-color: ${theme.variation};
      }
    `}
`;

const VariationHeaderRow = styled.tr`
  background-color: ${({ theme }) => theme.variationMuted};

  td {
    position: relative;
    height: 40px;
    padding: 0 10px 0 22px;
    box-sizing: border-box;
    vertical-align: middle;
  }

  td::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    background-color: ${({ theme }) => theme.variation};
  }
`;

const BranchBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.variation};
  background-color: ${({ theme }) => theme.variationMuted};
  box-shadow: inset 0 0 0 1px ${({ theme }) => `${theme.variation}33`};
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
  }
`;

const ContinuationMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 28px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Cell = styled.td<{ $align?: 'left' | 'center' }>`
  padding: 2px 6px;
  height: 40px;
  box-sizing: border-box;
  vertical-align: middle;
  text-align: ${({ $align = 'center' }) => $align};

  &:first-child {
    padding-left: 10px;
  }

  &:last-child {
    padding-right: 10px;
  }
`;

const MoveNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 28px;
  min-height: 36px;
  padding: 0 4px;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const moveCellStyles = css<{
  $viewing?: boolean;
  $pending?: boolean;
  $clickable?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 28px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  font: inherit;
  font-size: 0.875rem;
  font-weight: ${({ $pending }) => ($pending ? 700 : 500)};
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  color: ${({ theme, $viewing, $pending }) => {
    if ($pending) {
      return theme.accent;
    }

    if ($viewing) {
      return theme.accent;
    }

    return theme.text.primary;
  }};
  background: ${({ theme, $viewing }) => ($viewing ? theme.accentMuted : 'transparent')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;

  ${({ $viewing, theme }) =>
    $viewing &&
    css`
      box-shadow: inset 0 0 0 1px ${theme.accent}44;
    `}

  ${({ $clickable, theme }) =>
    $clickable &&
    css`
      &:hover {
        background-color: ${theme.button.background};
      }
    `}
`;

const MoveCellButton = styled.button<{
  $viewing?: boolean;
  $pending?: boolean;
  $variation?: boolean;
}>`
  ${moveCellStyles}
  cursor: pointer;
  outline: none;

  &:focus,
  &:focus-visible {
    outline: none;
  }

  ${({ $variation, $viewing, theme }) =>
    $variation &&
    css`
      font-style: italic;
      color: ${theme.variation};
      background: ${$viewing ? theme.variationMuted : 'transparent'};
      box-shadow: ${$viewing ? `inset 0 0 0 1px ${theme.variation}66` : 'none'};
    `}

  &:hover {
    background-color: ${({ theme, $viewing, $variation }) =>
      $viewing
        ? $variation
          ? theme.variationMuted
          : theme.accentMuted
        : theme.button.background};
  }
`;

const MoveCellStatic = styled.span<{ $pending?: boolean }>`
  ${moveCellStyles}
  pointer-events: none;
  cursor: default;
`;

const EmptyState = styled.div`
  padding: 12px 0;
  text-align: center;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.muted};
  line-height: 1.45;
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.accent};
  background-color: ${({ theme }) => theme.accentMuted};
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => `${theme.accent}33`};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  svg {
    width: 22px;
    height: 22px;
    display: block;
  }
`;

const PositionLabel = styled.span`
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
`;

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const BranchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="5" r="2.5" />
    <circle cx="6" cy="19" r="2.5" />
    <circle cx="18" cy="12" r="2.5" />
    <path d="M6 7.5v9" />
    <path d="M6 12h6.5a3 3 0 0 0 3-3" />
  </svg>
);

type MoveHistoryProps = {
  rows: MoveHistoryRow[];
  positionIndex: number;
  liveMoveCount: number;
  onSelectPly: (ply: number, kind: HistoryRowKind) => void;
  onStep: (ply: number) => void;
};

const MoveHistory = ({
  rows,
  positionIndex,
  liveMoveCount,
  onSelectPly,
  onStep,
}: MoveHistoryProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);
  const canGoPrevious = positionIndex > 0;
  const canGoNext = positionIndex < liveMoveCount;

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    if (positionIndex === 0) {
      scrollArea.scrollTop = 0;
      return;
    }

    activeMoveRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [positionIndex, rows]);

  return (
    <Card title="Move History" collapsibleOnMobile>
      {rows.length === 0 ? (
        <EmptyState>
          <EmptyText>Moves will appear here as you play.</EmptyText>
        </EmptyState>
      ) : (
        <Root>
          <NavBar>
            <NavButtons>
              <NavButton
                type="button"
                aria-label="Previous move"
                disabled={!canGoPrevious}
                onClick={() => onStep(positionIndex - 1)}
              >
                <ChevronLeft />
              </NavButton>
              <NavButton
                type="button"
                aria-label="Next move"
                disabled={!canGoNext}
                onClick={() => onStep(positionIndex + 1)}
              >
                <ChevronRight />
              </NavButton>
            </NavButtons>
            <PositionLabel>
              {positionIndex} / {liveMoveCount}
            </PositionLabel>
          </NavBar>
          <ScrollArea ref={scrollAreaRef} aria-label="Move list">
            <Table>
              <TableHead>
                <tr>
                  <HeaderCell $align="left">#</HeaderCell>
                  <HeaderCell>White</HeaderCell>
                  <HeaderCell>Black</HeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {rows.map((row, index) => {
                  const isVariation = row.kind === 'variation';
                  const isVariationStart =
                    isVariation && rows[index - 1]?.kind !== 'variation';

                  return (
                    <Fragment key={row.key}>
                      {isVariationStart && (
                        <VariationHeaderRow>
                          <Cell colSpan={3} $align="left">
                            <BranchBadge>
                              <BranchIcon />
                              Variation
                            </BranchBadge>
                          </Cell>
                        </VariationHeaderRow>
                      )}
                      <BodyRow
                        $active={row.isActive}
                        $variation={isVariation}
                      >
                        <Cell $align="left">
                          <MoveNumber>{row.number}</MoveNumber>
                        </Cell>
                      <Cell>
                        {row.white && row.whitePly !== null ? (
                          <MoveCellButton
                            ref={row.isWhiteViewing ? activeMoveRef : undefined}
                            type="button"
                            $viewing={row.isWhiteViewing}
                            $variation={isVariation}
                            aria-label={`Go to after ${row.white}`}
                            aria-current={row.isWhiteViewing ? 'true' : undefined}
                            onClick={() => onSelectPly(row.whitePly!, row.kind)}
                          >
                            {row.white}
                          </MoveCellButton>
                        ) : row.whiteContinuation ? (
                          <ContinuationMark aria-hidden="true">…</ContinuationMark>
                        ) : row.pendingWhite ? (
                          <MoveCellStatic $pending aria-label="White to move">
                            ···
                          </MoveCellStatic>
                        ) : null}
                      </Cell>
                      <Cell>
                        {row.black && row.blackPly !== null ? (
                          <MoveCellButton
                            ref={row.isBlackViewing ? activeMoveRef : undefined}
                            type="button"
                            $viewing={row.isBlackViewing}
                            $variation={isVariation}
                            aria-label={`Go to after ${row.black}`}
                            aria-current={row.isBlackViewing ? 'true' : undefined}
                            onClick={() => onSelectPly(row.blackPly!, row.kind)}
                          >
                            {row.black}
                          </MoveCellButton>
                        ) : row.pendingBlack ? (
                          <MoveCellStatic $pending aria-label="Black to move">
                            ···
                          </MoveCellStatic>
                        ) : null}
                      </Cell>
                    </BodyRow>
                    </Fragment>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
        </Root>
      )}
    </Card>
  );
};

export default MoveHistory;
