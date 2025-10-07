import { ThemeContext } from "../Providers/ThemeProvider";
import { useContext } from "react";

import "./ThemeToggle.less";
import Dark from "../Assets/Dark.svg";
import Light from "../Assets/Light.svg";
import { Theme } from "../../utils/enums";
import { FloatButton } from "../antdES";

export const ThemeToggle = () => {
  const theme = useContext(ThemeContext);

  const toggleTheme = () => {
    let root = document.querySelector(":root");
    if (root) root.classList.toggle("dark");

    if (theme.state.theme === Theme.LIGHT) {
      theme.actions.setTheme(Theme.DARK);
      return;
    }
    theme.actions.setTheme(Theme.LIGHT);
  };

  const getThemeIcon = () => {
    const t = theme.state.theme;
    return (
      <FloatButton
        type={t === Theme.DARK ? "default" : "primary"}
        onClick={toggleTheme}
        icon={
          <img
            className="toggle-theme-btn"
            src={t === Theme.DARK ? Light : Dark}
          />
        }
      />
    );
  };

  return <div id="theme-toggle-container">{getThemeIcon()}</div>;
};
