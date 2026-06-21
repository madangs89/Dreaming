import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";
import { useTheme } from "../hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../modules/auth/auth.api";
import toast from "react-hot-toast";
import { clearAuthenticated } from "../app/slice/authSlice";
import Spinner from "./Spinner";

const navItems: { label: string; path: string }[] = [
  { label: "Reviews", path: "/revision" },
];

const MainNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard";

  const theme = useAppSelector((state) => state.theme.theme);
  const authSliceDetails = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    bg,
    cardBg,
    cardBorder,
    titleColor,
    subtleText,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    dangerColor,
    dangerBg,
  } = useTheme(theme);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      dispatch(clearAuthenticated());
      toast.success("Logged out successfully");
      navigate("/");
    },
    onError: () => {
      toast.error("Logout failed! Please try again.");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userName = authSliceDetails?.user?.name || "User";
  const userEmail = authSliceDetails?.user?.email || "";
  const userInitial = userName?.charAt(0)?.toUpperCase() || "M";

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      style={{ backgroundColor: bg }}
      className="w-full h-fit flex flex-col fixed top-0 left-0 right-0 z-50"
    >
      <div className="w-full flex items-center justify-between py-3 px-4 sm:px-6 lg:px-12">
        <div className="flex items-center gap-3 sm:gap-6">
          <h3
            style={{ color: titleColor }}
            className="font-bold text-xl sm:text-2xl cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            OVERTHINK
          </h3>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2">
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
                  className="ml-6 text-[17px] font-semibold transition-colors duration-300 cursor-pointer pb-1"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitch />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = primaryBtnHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryBtnBg)
              }
              className="
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                font-semibold
                transition-colors duration-300
                flex items-center justify-center
                shrink-0
              "
            >
              {userInitial}
            </button>

            {profileOpen && (
              <div
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                className="
                  absolute right-0 mt-3
                  w-64
                  rounded-2xl
                  border
                  shadow-lg
                  p-4
                  z-50
                "
              >
                <p
                  style={{ color: titleColor }}
                  className="font-semibold text-base truncate"
                >
                  {userName}
                </p>
                {userEmail && (
                  <p
                    style={{ color: subtleText }}
                    className="text-sm mt-1 truncate"
                  >
                    {userEmail}
                  </p>
                )}

                <div
                  style={{ borderColor: cardBorder }}
                  className="border-t mt-3 pt-3"
                >
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    style={{ color: dangerColor, backgroundColor: dangerBg }}
                    className="
                      w-full
                      text-left
                      text-sm
                      font-medium
                      rounded-lg
                      px-3 py-2
                      transition-colors duration-200
                    "
                  >
                    {logoutMutation.isPending ? <Spinner /> : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              style={{ color: titleColor }}
              className="w-10 h-10 flex items-center justify-center shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            {mobileMenuOpen && (
              <div
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                className="
                  absolute right-0 mt-3
                  w-48
                  rounded-2xl
                  border
                  shadow-lg
                  p-2
                  z-50
                "
              >
                {navItems.map(({ label, path }) => {
                  const isActive = location.pathname === path;
                  return (
                    <span
                      key={label}
                      onClick={() => {
                        navigate(path);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        color: isActive ? titleColor : subtleText,
                        backgroundColor: isActive ? bg : "transparent",
                      }}
                      className="
                        block
                        text-[15px]
                        font-medium
                        rounded-lg
                        px-3 py-2
                        cursor-pointer
                        transition-colors duration-200
                      "
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
