import { ThemeContext } from "../Providers/ThemeProvider";
import { useContext } from "react";

import "./ThemeToggle.less";
import Dark from "../Assets/Dark.svg";
import Light from "../Assets/Light.svg";
import { Theme } from "../../utils/enums";

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
    if (theme.state.theme === Theme.DARK) {
      return (
        <div className="theme-button" id="light-button">
          <img src={Light} onClick={toggleTheme} />
        </div>
      );
    }
    return (
      <div className="theme-button" id="dark-button">
        <img src={Dark} onClick={toggleTheme} />
      </div>
    );
  };

  return <div id="theme-toggle-container">{getThemeIcon()}</div>;
};
