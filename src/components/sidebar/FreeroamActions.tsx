import styled from "styled-components";

import Card from "@/components/ui/Card";

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  flex: 1 1 auto;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.accent};
  background-color: transparent;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.accentMuted};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

type FreeroamActionsProps = {
  hasProgress: boolean;
  onImport: () => void;
  onReset: () => void;
  onFlipBoard: () => void;
};

const FreeroamActions = ({
  hasProgress,
  onImport,
  onReset,
  onFlipBoard,
}: FreeroamActionsProps) => (
  <Card title="Actions" collapsibleOnMobile>
    <Buttons>
      <ActionButton type="button" onClick={onImport}>
        Import / Export
      </ActionButton>
      <ActionButton type="button" onClick={onFlipBoard}>
        Flip board
      </ActionButton>
      <ActionButton type="button" onClick={onReset} disabled={!hasProgress}>
        New game
      </ActionButton>
    </Buttons>
  </Card>
);

export default FreeroamActions;
