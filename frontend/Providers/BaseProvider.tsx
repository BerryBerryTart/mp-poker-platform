import { type PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { GameProvider } from "./GameProvider";
import { AdminProvider } from "./AdminProvider";

export const BaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <AdminProvider>
        <GameProvider>{children}</GameProvider>
      </AdminProvider>
    </ThemeProvider>
  );
};
