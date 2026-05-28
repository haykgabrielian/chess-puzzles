import styled from 'styled-components';
import { useContext } from 'react';

import logo from '@/assets/logo.png';
import logoDarkMode from '@/assets/logo_dark_mode.png';
import BoardThemePicker from '@/components/board/BoardThemePicker';
import { ThemeToggleContext } from '@/context/ThemeContext';

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  color: ${({ theme }) => theme.header.text};
`;

const Logo = styled.img`
  height: 50px;
  width: auto;
`;

const Header = () => {
  const { isDarkMode } = useContext(ThemeToggleContext);

  return (
    <HeaderBar>
      <Logo src={isDarkMode ? logoDarkMode : logo} alt="Chess Puzzles" />
      <BoardThemePicker />
    </HeaderBar>
  );
};

export default Header;
