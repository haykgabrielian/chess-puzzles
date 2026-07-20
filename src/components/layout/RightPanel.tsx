import { Link } from "@tanstack/react-router";
import { type ReactNode, useContext, useState } from "react";
import styled from "styled-components";

import logo from "@/assets/logo.png";
import logoDarkMode from "@/assets/logo_dark_mode.png";
import { BoardSettingsPanel } from "@/components/board/BoardSettings";
import PanelMenu from "@/components/layout/PanelMenu";
import { ThemeToggleContext } from "@/context/ThemeContext";
import { formatDateForUrl, getToday } from "@/helpers/date";

type PanelMode = "content" | "menu" | "settings";

const MOBILE = "@media (max-width: 900px)";

const PanelRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;

  ${MOBILE} {
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
`;

const LogoLink = styled.div`
  display: flex;
  line-height: 0;
  flex-shrink: 0;

  & > a {
    display: flex;
    line-height: 0;
  }
`;

const Logo = styled.img`
  height: 34px;
  width: auto;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.accent};
  background-color: ${({ $active, theme }) =>
    $active ? `${theme.accent}33` : theme.accentMuted};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.accent}33`};
  }

  svg {
    width: 26px;
    height: 26px;
    display: block;
  }
`;

const PanelCard = styled.div`
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
`;

const SettingsCard = styled(PanelCard)`
  padding: 16px;
`;

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

type RightPanelProps = {
  children: ReactNode;
};

const RightPanel = ({ children }: RightPanelProps) => {
  const { isDarkMode } = useContext(ThemeToggleContext);
  const [mode, setMode] = useState<PanelMode>("content");
  const todayDate = formatDateForUrl(getToday());

  const toggleMode = (target: Exclude<PanelMode, "content">) => {
    setMode((current) => (current === target ? "content" : target));
  };

  return (
    <PanelRoot aria-label="Board panel">
      <TopBar>
        <LogoLink>
          <Link to="/$date" params={{ date: todayDate }}>
            <Logo src={isDarkMode ? logoDarkMode : logo} alt="Chess Puzzles" />
          </Link>
        </LogoLink>
        <Actions>
          <IconButton
            type="button"
            aria-label="Settings"
            aria-pressed={mode === "settings"}
            $active={mode === "settings"}
            onClick={() => toggleMode("settings")}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            type="button"
            aria-label="Menu"
            aria-pressed={mode === "menu"}
            $active={mode === "menu"}
            onClick={() => toggleMode("menu")}
          >
            <MenuIcon />
          </IconButton>
        </Actions>
      </TopBar>

      {mode === "menu" && (
        <PanelCard>
          <PanelMenu onNavigate={() => setMode("content")} />
        </PanelCard>
      )}

      {mode === "settings" && (
        <SettingsCard>
          <BoardSettingsPanel />
        </SettingsCard>
      )}

      {mode === "content" && (
        <PanelCard>
          {children}
        </PanelCard>
      )}
    </PanelRoot>
  );
};

export default RightPanel;
