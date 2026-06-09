import React, { ReactNode, useState } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

import { ThemeToggleContext } from "@/context/ThemeContext";
import { darkTheme, lightTheme } from "@/helpers/themes";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");

  if (!savedTheme) {
    localStorage.setItem("theme", "dark");
    return true;
  }

  return savedTheme === "dark";
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem("theme", !prev ? "dark" : "light");
      return !prev;
    });
  };

  return (
    <StyledThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeToggleContext.Provider value={{ isDarkMode, toggleTheme }}>
        {children}
      </ThemeToggleContext.Provider>
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
