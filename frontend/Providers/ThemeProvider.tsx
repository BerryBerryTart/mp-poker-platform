import { createContext, useState, type PropsWithChildren } from "react";
import { Theme } from "../../utils/enums";
import { ConfigProvider, theme as antdTheme } from "../antdES";

interface ThemeContextType {
  state: {
    theme: Theme;
  };
  actions: {
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  };
}

const ThemeContext = createContext<ThemeContextType>({
  state: { theme: Theme.DARK },
  actions: { setTheme: () => {} },
});

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  const value: ThemeContextType = {
    state: { theme },
    actions: { setTheme },
  };

  return (
    <ThemeContext value={value}>
      <ConfigProvider
        theme={{
          algorithm:
            theme === Theme.LIGHT
              ? antdTheme.defaultAlgorithm
              : antdTheme.darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext>
  );
};

export { ThemeContext, ThemeProvider };
