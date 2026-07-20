import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import styled from "styled-components";

import {
  CalendarIcon,
  FreeroamIcon,
  PuzzleInfoIcon,
} from "@/components/ui/CardIcons";
import { formatDateForUrl, getToday } from "@/helpers/date";

const DATE_PATH_PATTERN = /^\/\d{4}-\d{2}-\d{2}$/;

const MenuList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
`;

const MenuItem = styled.div<{ $active: boolean }>`
  & > a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    color: ${({ $active, theme }) =>
      $active ? theme.accent : theme.text.primary};
    background-color: ${({ $active, theme }) =>
      $active ? theme.accentMuted : "transparent"};
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  & > a:hover {
    background-color: ${({ theme }) => theme.accentMuted};
    color: ${({ theme }) => theme.accent};
  }

  & > a svg {
    color: ${({ $active, theme }) =>
      $active ? theme.accent : theme.text.secondary};
  }
`;

type PanelMenuProps = {
  onNavigate?: () => void;
};

type MenuItem = {
  key: string;
  to: string;
  params?: { date: string };
  label: string;
  icon: ReactNode;
  active: boolean;
};

const PanelMenu = ({ onNavigate }: PanelMenuProps) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const todayDate = formatDateForUrl(getToday());

  const items: MenuItem[] = [
    {
      key: "puzzles",
      to: "/$date",
      params: { date: todayDate },
      label: "Puzzles",
      icon: <CalendarIcon />,
      active: DATE_PATH_PATTERN.test(pathname),
    },
    {
      key: "sandbox",
      to: "/freeroam",
      label: "Sandbox",
      icon: <FreeroamIcon />,
      active: pathname === "/freeroam",
    },
    {
      key: "about",
      to: "/about",
      label: "About",
      icon: <PuzzleInfoIcon />,
      active: pathname === "/about",
    },
  ];

  return (
    <MenuList aria-label="Main navigation">
      {items.map((item) => (
        <MenuItem key={item.key} $active={item.active}>
          {item.params ? (
            <Link to={item.to} params={item.params} onClick={onNavigate}>
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Link to={item.to} onClick={onNavigate}>
              {item.icon}
              {item.label}
            </Link>
          )}
        </MenuItem>
      ))}
    </MenuList>
  );
};

export default PanelMenu;
