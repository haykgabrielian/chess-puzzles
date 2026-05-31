import styled from 'styled-components';
import { useContext } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';

import logo from '@/assets/logo.png';
import logoDarkMode from '@/assets/logo_dark_mode.png';
import BoardThemePicker from '@/components/board/BoardThemePicker';
import { ThemeToggleContext } from '@/context/ThemeContext';
import { formatDateForUrl, getToday } from '@/helpers/date';

const DATE_PATH_PATTERN = /^\/\d{4}-\d{2}-\d{2}$/;

const HeaderBar = styled.header`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px 0;
  background-color: ${({ theme }) => theme.header.background};
  color: ${({ theme }) => theme.header.text};
  border-bottom: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    padding: 8px 12px 0;
  }
`;

const Start = styled.div`
  display: flex;
  align-items: stretch;
  gap: 96px;
  min-width: 0;
  flex: 1;

  @media (max-width: 600px) {
    gap: 36px;
  }
`;

const LogoLinkWrap = styled.div`
  display: flex;
  line-height: 0;
  flex-shrink: 0;
  align-self: center;
  padding-bottom: 8px;

  & > a {
    display: flex;
    line-height: 0;
  }
`;

const Logo = styled.img`
  height: 50px;
  width: auto;

  @media (max-width: 600px) {
    height: 40px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 28px;
  margin-bottom: -1px;

  @media (max-width: 600px) {
    gap: 16px;
  }
`;

const NavItem = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text.secondary)};
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  box-sizing: border-box;
  border-bottom: 3px solid ${({ $active, theme }) => ($active ? theme.accent : 'transparent')};
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const NavLinkWrap = styled.div`
  display: flex;
  align-self: stretch;

  & > a {
    display: flex;
    align-self: stretch;
    align-items: center;
    text-decoration: none;
  }

  &:hover ${NavItem} {
    color: ${({ theme }) => theme.accent};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  padding-bottom: 8px;
`;

type NavLinkItemProps = {
  to: string;
  params?: { date: string };
  active: boolean;
  children: string;
};

const NavLinkItem = ({ to, params, active, children }: NavLinkItemProps) => (
  <NavLinkWrap>
    {params ? (
      <Link to={to} params={params}>
        <NavItem $active={active}>{children}</NavItem>
      </Link>
    ) : (
      <Link to={to}>
        <NavItem $active={active}>{children}</NavItem>
      </Link>
    )}
  </NavLinkWrap>
);

const Header = () => {
  const { isDarkMode } = useContext(ThemeToggleContext);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const todayDate = formatDateForUrl(getToday());
  const isPuzzlesActive = DATE_PATH_PATTERN.test(pathname);
  const isSandboxActive = pathname === '/freeroam';
  const isAboutActive = pathname === '/about';

  return (
    <HeaderBar>
      <Start>
        <LogoLinkWrap>
          <Link to="/$date" params={{ date: todayDate }}>
            <Logo src={isDarkMode ? logoDarkMode : logo} alt="Chess Puzzles" />
          </Link>
        </LogoLinkWrap>
        <Nav aria-label="Main navigation">
          <NavLinkItem
            to="/$date"
            params={{ date: todayDate }}
            active={isPuzzlesActive}
          >
            Puzzles
          </NavLinkItem>
          <NavLinkItem to="/freeroam" active={isSandboxActive}>
            Sandbox
          </NavLinkItem>
          <NavLinkItem to="/about" active={isAboutActive}>
            About
          </NavLinkItem>
        </Nav>
      </Start>
      <HeaderActions>
        <BoardThemePicker />
      </HeaderActions>
    </HeaderBar>
  );
};

export default Header;
