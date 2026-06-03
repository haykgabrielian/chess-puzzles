import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import BoardThemeProvider from '@/context/BoardThemeProvider';
import PieceSetProvider from '@/context/PieceSetProvider';
import QueryProvider from '@/context/QueryProvider';
import ThemeProvider from '@/context/ThemeProvider';
import router from '@/router';

import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <BoardThemeProvider>
          <PieceSetProvider>
            <RouterProvider router={router} />
          </PieceSetProvider>
        </BoardThemeProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
