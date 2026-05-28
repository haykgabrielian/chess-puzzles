import styled from 'styled-components';
import { useContext } from 'react';
import { Link } from '@tanstack/react-router';

import logo from '@/assets/logo.png';
import logoDarkMode from '@/assets/logo_dark_mode.png';
import BoardThemePicker from '@/components/board/BoardThemePicker';
import { ThemeToggleContext } from '@/context/ThemeContext';

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.header.background};
  color: ${({ theme }) => theme.header.text};

  @media (max-width: 600px) {
    padding: 8px 12px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  line-height: 0;
`;

const Logo = styled.img`
  height: 50px;
  width: auto;

  @media (max-width: 600px) {
    height: 40px;
  }
`;

const Header = () => {
  const { isDarkMode } = useContext(ThemeToggleContext);

  return (
    <HeaderBar>
      <LogoLink to="/">
        <Logo src={isDarkMode ? logoDarkMode : logo} alt="Chess Puzzles" />
      </LogoLink>
      <BoardThemePicker />
    </HeaderBar>
  );
};

export default Header;
