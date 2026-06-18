import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { getAllTodayRevisions } from "./revision.api";
import type { RevisionBody } from "./revision.types";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const isDueToday = (date: Date) =>
  new Date(date).toDateString() === new Date().toDateString();

const ReviewCard = ({ review }: { review: RevisionBody }) => {
  const navigate = useNavigate();
  const [theme] = React.useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  const {
    cardBg,
    cardBorder,
    subtleText,
    titleColor,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    pillBg,
    pillText,
  } = useTheme(theme);

  const due = isDueToday(review.scheduled_date);

  const handleStart = () => {
    navigate(`/revision/${review.id}/${review.topic.id}/attempt`);
  };

  return (
    <div
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
      className="w-full rounded-2xl border p-6 sm:p-8 shadow-sm"
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-6">
        <span
          style={{ backgroundColor: pillBg, color: pillText }}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase"
        >
          Topic: {review?.topic?.title}
        </span>

        <span style={{ color: subtleText }} className="text-xs font-medium">
          Review {review?.review_count}
        </span>
      </div>

      {/* Note title */}
      <h2
        style={{ color: titleColor }}
        className="text-2xl sm:text-3xl font-bold leading-snug mb-2"
      >
        {review?.notes.title}
      </h2>

      {/* Status line */}
      <p style={{ color: subtleText }} className="text-sm mb-8">
        {due
          ? "Review due today"
          : `Review scheduled for ${new Date(
              review.scheduled_date,
            ).toLocaleDateString()}`}
      </p>

      {/* CTA */}
      <button
        onClick={handleStart}
        style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = primaryBtnHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = primaryBtnBg)
        }
        className="w-full rounded-xl py-3.5 font-semibold text-base transition-colors duration-200"
      >
        Start Revision
      </button>
    </div>
  );
};

const RevisionPage = () => {
  const revisionQuery = useQuery({
    queryKey: ["today_revision"],
    queryFn: getAllTodayRevisions,
    retry: 3,
  });

  const reviews: RevisionBody[] = revisionQuery.data || [];

  const [theme] = React.useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  const { bg, subtleText, titleColor } = useTheme(theme);

  useEffect(() => {
    if (revisionQuery.isError) {
      toast.error("");
    }
  }, [revisionQuery.isError]);

  return (
    <div style={{ backgroundColor: bg }} className="h-screen w-screen ">
      <div className="w-full mx-auto lg:px-12 p-4">
        <h1
          style={{ color: titleColor }}
          className="text-xl font-bold mb-6 px-1"
        >
          Reviews
        </h1>

        {revisionQuery.isLoading ? (
          <div className="flex items-center justify-center w-full h-[80vh]">
            <Spinner />
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ color: subtleText }} className="px-1 text-sm">
            No reviews due right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionPage;
