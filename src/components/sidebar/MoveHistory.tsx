import { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import Card from '@/components/ui/Card';
import { HistoryIcon } from '@/components/ui/CardIcons';
import type { MoveHistoryRow } from '@/helpers/chess';

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
  font-size: 0.6875rem;
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

const BodyRow = styled.tr<{ $active?: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    css`
      background-color: ${theme.accentMuted};

      td {
        padding-top: 4px;
        padding-bottom: 4px;
      }

      td:first-child {
        padding-left: 8px;
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }

      td:last-child {
        padding-right: 8px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    `}

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const Cell = styled.td<{ $align?: 'left' | 'center' }>`
  padding: 2px 6px;
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
  padding: 6px 4px;
  font-size: 0.8125rem;
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
  min-height: 30px;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: ${({ $viewing, $pending }) => ($viewing || $pending ? 700 : 500)};
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

      &:active {
        background-color: ${theme.button.hover};
      }
    `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 1px;
  }
`;

const MoveCellButton = styled.button<{ $viewing?: boolean; $pending?: boolean }>`
  ${moveCellStyles}
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.button.background};
  }

  &:active {
    background-color: ${({ theme }) => theme.button.hover};
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

type MoveHistoryProps = {
  rows: MoveHistoryRow[];
  positionIndex: number;
  liveMoveCount: number;
  onSelectPly: (ply: number) => void;
};

const MoveHistory = ({ rows, positionIndex, liveMoveCount, onSelectPly }: MoveHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canGoPrevious = positionIndex > 0;
  const canGoNext = positionIndex < liveMoveCount;

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const activeMove = container.querySelector('[aria-current="true"]');

    if (activeMove) {
      activeMove.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (positionIndex === liveMoveCount) {
      container.scrollTop = container.scrollHeight;
    }
  }, [liveMoveCount, positionIndex, rows]);

  return (
    <Card title="Move History" icon={<HistoryIcon />} collapsibleOnMobile>
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
                onClick={() => onSelectPly(positionIndex - 1)}
              >
                <ChevronLeft />
              </NavButton>
              <NavButton
                type="button"
                aria-label="Next move"
                disabled={!canGoNext}
                onClick={() => onSelectPly(positionIndex + 1)}
              >
                <ChevronRight />
              </NavButton>
            </NavButtons>
            <PositionLabel>
              {positionIndex} / {liveMoveCount}
            </PositionLabel>
          </NavBar>
          <ScrollArea ref={scrollRef} aria-label="Move list">
            <Table>
              <TableHead>
                <tr>
                  <HeaderCell $align="left">#</HeaderCell>
                  <HeaderCell>White</HeaderCell>
                  <HeaderCell>Black</HeaderCell>
                </tr>
              </TableHead>
              <tbody>
                {rows.map(row => (
                  <BodyRow key={row.number} $active={row.isActive}>
                    <Cell $align="left">
                      <MoveNumber>{row.number}</MoveNumber>
                    </Cell>
                    <Cell>
                      {row.white && row.whitePly !== null ? (
                        <MoveCellButton
                          type="button"
                          $viewing={row.isWhiteViewing}
                          aria-label={`Go to after ${row.white}`}
                          aria-current={row.isWhiteViewing ? 'true' : undefined}
                          onClick={() => onSelectPly(row.whitePly!)}
                        >
                          {row.white}
                        </MoveCellButton>
                      ) : row.pendingWhite ? (
                        <MoveCellStatic $pending aria-label="White to move">
                          ···
                        </MoveCellStatic>
                      ) : null}
                    </Cell>
                    <Cell>
                      {row.black && row.blackPly !== null ? (
                        <MoveCellButton
                          type="button"
                          $viewing={row.isBlackViewing}
                          aria-label={`Go to after ${row.black}`}
                          aria-current={row.isBlackViewing ? 'true' : undefined}
                          onClick={() => onSelectPly(row.blackPly!)}
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
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Root>
      )}
    </Card>
  );
};

export default MoveHistory;
