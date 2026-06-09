import "./main.css";

import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import BoardSettingsProvider from "@/context/BoardSettingsProvider";
import PieceSetProvider from "@/context/PieceSetProvider";
import QueryProvider from "@/context/QueryProvider";
import ThemeProvider from "@/context/ThemeProvider";
import router from "@/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <BoardSettingsProvider>
          <PieceSetProvider>
            <RouterProvider router={router} />
          </PieceSetProvider>
        </BoardSettingsProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
