export const useTheme = (theme: "light" | "dark") => {
  const isDark = theme === "dark";
  const bg = isDark ? "#1F1F1F" : "#ffffff";
  const sidebarBg = isDark ? "#252525" : "#f9f9f8";
  const sidebarBorder = isDark ? "#3f3f46" : "#e4e4e7";
  const sidebarHeaderText = isDark ? "#ffffff" : "#18181b";
  const sidebarCloseText = isDark ? "#a1a1aa" : "#71717a";
  const sidebarCloseHover = isDark ? "#ffffff" : "#18181b";
  const newNoteBtn = isDark ? "#3f3f46" : "#e4e4e7";
  const newNoteBtnHover = isDark ? "#52525b" : "#d4d4d8";
  const newNoteBtnText = isDark ? "#ffffff" : "#18181b";
  const noteItemActiveBg = isDark ? "#3f3f46" : "#e4e4e7";
  const noteItemActiveBorder = isDark ? "#52525b" : "#d4d4d8";
  const noteItemHoverBg = isDark ? "#18181b" : "#f0f0ef";
  const noteItemHoverBorder = isDark ? "#3f3f46" : "#e4e4e7";
  const noteItemActiveTitle = isDark ? "#ffffff" : "#18181b";
  const noteItemInactiveTitle = isDark ? "#d4d4d8" : "#3f3f46";
  const noteItemActiveDate = isDark ? "#a1a1aa" : "#71717a";
  const noteItemInactiveDate = isDark ? "#71717a" : "#a1a1aa";
  const noNotesText = isDark ? "#a1a1aa" : "#71717a";
  const menuBtnBg = isDark ? "#2A2A2A" : "#f0f0ef";
  const menuBtnBgHover = isDark ? "#353535" : "#e4e4e7";
  const menuBtnText = isDark ? "#ffffff" : "#18181b";
  const dividerColor = isDark ? "#3f3f46" : "#e4e4e7";
  const titleColor = isDark ? "#ffffff" : "#18181b";
  const titlePlaceholder = isDark ? "#373737" : "#d4d4d8";
  const titleBg = bg;
  const createdLabelColor = "#A4A09B";
  const createdValueColor = isDark ? "#ffffff" : "#18181b";
  const skeletonBg = isDark ? "#3f3f46" : "#e4e4e7";
  const backdropBg = "rgba(0,0,0,0.3)";

  const cardBg = isDark ? "#252525" : "#f9f9f8";
  const cardBorder = isDark ? "#3f3f46" : "#e4e4e7";
  const subtleText = isDark ? "#a1a1aa" : "#71717a";
  const primaryBtnBg = isDark ? "#ffffff" : "#18181b";
  const primaryBtnText = isDark ? "#18181b" : "#ffffff";
  const primaryBtnHover = isDark ? "#e4e4e7" : "#27272a";
  const successColor = isDark ? "#4ade80" : "#16a34a";
  const dangerColor = isDark ? "#f87171" : "#dc2626";
  const successBg = isDark ? "rgba(74,222,128,0.1)" : "rgba(22,163,74,0.08)";
  const dangerBg = isDark ? "rgba(248,113,113,0.1)" : "rgba(220,38,38,0.08)";
  const pillBg = isDark ? "#3f3f46" : "#e4e4e7";
  const pillText = isDark ? "#d4d4d8" : "#3f3f46";
  const recordIdleBg = isDark ? "#3f3f46" : "#18181b";
  const recordActiveBg = isDark ? "#f87171" : "#dc2626";
  const progressTrack = isDark ? "#3f3f46" : "#e4e4e7";
  const progressFill = isDark ? "#ffffff" : "#18181b";
  return {
    bg,
    sidebarBg,
    sidebarBorder,
    sidebarHeaderText,
    sidebarCloseText,
    sidebarCloseHover,
    newNoteBtn,
    newNoteBtnHover,
    newNoteBtnText,
    noteItemActiveBg,
    noteItemActiveBorder,
    noteItemHoverBg,
    noteItemHoverBorder,
    noteItemActiveTitle,
    noteItemInactiveTitle,
    noteItemActiveDate,
    noteItemInactiveDate,
    noNotesText,
    menuBtnBg,
    menuBtnBgHover,
    menuBtnText,
    dividerColor,
    titleColor,
    titlePlaceholder,
    titleBg,
    createdLabelColor,
    createdValueColor,
    skeletonBg,
    backdropBg,
    cardBg,
    cardBorder,
    subtleText,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    successColor,
    dangerColor,
    successBg,
    dangerBg,
    pillBg,
    pillText,

    recordIdleBg,
    recordActiveBg,
    progressTrack,
    progressFill,
  };
};
