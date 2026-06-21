import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";
import { useTheme } from "../hooks/useTheme";
import { useAppSelector } from "../app/hook";

const navItems: { label: string; path: string }[] = [
  { label: "Reviews", path: "/revision" },
];

const MainNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard";

  const theme = useAppSelector((state) => state.theme.theme);

  const {
    bg,
    titleColor,
    subtleText,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
  } = useTheme(theme);

  return (
    <nav
      style={{ backgroundColor: bg }}
      className="w-screen h-fit flex flex-col overflow-hidden fixed top-0 right-0"
    >
      <div className="w-full flex items-center justify-between lg:py-3 px-2 lg:px-12">
        <div className="flex items-center justify-center gap-3">
          <h3 style={{ color: titleColor }} className="font-bold text-2xl">
            OVERTHINK
          </h3>

          {navItems.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <span
                key={label}
                onClick={() => navigate(path)}
                style={{
                  color: isActive ? titleColor : subtleText,
                  borderBottom: isActive
                    ? `2px solid ${titleColor}`
                    : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = titleColor;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = subtleText;
                }}
                className="ml-8 lg:block hidden text-semibold text-[17px] transition-colors duration-300 cursor-pointer pb-1"
              >
                {label}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitch />

          <button
            style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = primaryBtnHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = primaryBtnBg)
            }
            className="
        w-11 h-11
        rounded-full
        font-semibold
        transition-colors duration-300
      "
          >
            M
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
