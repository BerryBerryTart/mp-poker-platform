import { type PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { GameProvider } from "./GameProvider";

export const BaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <GameProvider>{children}</GameProvider>
    </ThemeProvider>
  );
};
