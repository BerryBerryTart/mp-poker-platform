import { type PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";

export const BaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
