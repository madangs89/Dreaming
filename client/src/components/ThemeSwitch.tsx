import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import Switch from "react-switch";
import { toggleTheme } from "../app/slice/themeSlice";
const ThemeSwitch = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const dispatch = useAppDispatch();
  return (
    <Switch
      checked={theme === "dark"}
      onChange={() => dispatch(toggleTheme())}
      height={15}
      width={42}
      handleDiameter={8}
      offColor="#e4e4e7"
      onColor="#27272a"
      offHandleColor="#ffffff"
      onHandleColor="#ffffff"
      uncheckedIcon={false}
      checkedIcon={false}
    />
  );
};

export default ThemeSwitch;
