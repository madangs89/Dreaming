import React from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useAppSelector } from "../../../app/hook";

export const TopicSkeleton = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  const { cardBg, cardBorder, skeletonBg } = useTheme(
    theme as "light" | "dark",
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="
            rounded-2xl
            border
            p-3
            animate-pulse
          "
        >
          <div
            style={{ backgroundColor: skeletonBg }}
            className="w-full aspect-video rounded-xl"
          />

          <div className="mt-4 space-y-3">
            <div
              style={{ backgroundColor: skeletonBg }}
              className="h-6 w-3/4 rounded"
            />

            <div
              style={{ backgroundColor: skeletonBg }}
              className="h-4 w-1/3 rounded"
            />

            <div
              style={{ backgroundColor: skeletonBg }}
              className="h-10 w-full rounded-lg mt-4"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
