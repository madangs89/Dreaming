import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

// ---------------------------------------------------------------------------
// STATIC / MOCK DATA — replace with your reviews query (GET /reviews?due=today etc.)
// A user can have multiple reviews due, so this is an array, not a single object.
// ---------------------------------------------------------------------------
type ReviewItem = {
  id: string;
  topicTitle: string;
  noteTitle: string;
  scheduledDate: Date;
  reviewCount: number;
};

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "review_1",
    topicTitle: "React",
    noteTitle: "Hooks Deep Dive",
    scheduledDate: new Date(), // due today
    reviewCount: 1,
  },
  {
    id: "review_2",
    topicTitle: "System Design",
    noteTitle: "Load Balancing Strategies",
    scheduledDate: new Date(), // due today
    reviewCount: 2,
  },
  {
    id: "review_3",
    topicTitle: "DSA",
    noteTitle: "Binary Search Variants",
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // due in 2 days
    reviewCount: 1,
  },
];

const isDueToday = (date: Date) =>
  new Date(date).toDateString() === new Date().toDateString();

const ReviewCard = ({ review }: { review: ReviewItem }) => {
  const navigate = useNavigate();

  // TODO: replace with shared/lifted theme state instead of re-reading localStorage per card
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

  const due = isDueToday(review.scheduledDate);

  const handleStart = () => {
    navigate(`/revision/${review.id}/attempt`);
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
          Topic: {review.topicTitle}
        </span>

        <span style={{ color: subtleText }} className="text-xs font-medium">
          Review {review.reviewCount}
        </span>
      </div>

      {/* Note title */}
      <h2
        style={{ color: titleColor }}
        className="text-2xl sm:text-3xl font-bold leading-snug mb-2"
      >
        {review.noteTitle}
      </h2>

      {/* Status line */}
      <p style={{ color: subtleText }} className="text-sm mb-8">
        {due
          ? "Review due today"
          : `Review scheduled for ${new Date(
              review.scheduledDate,
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

  // const { data: reviews = [] } = useQuery({ queryKey: ["reviews", "due"], queryFn: fetchDueReviews });
  const reviews: ReviewItem[] = MOCK_REVIEWS;

  const [theme] = React.useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  const { bg, subtleText, titleColor } = useTheme(theme);

  return (
    <div
      style={{ backgroundColor: bg }}
      className="h-screen w-screen px-4 py-10"
    >
      <div className="w-full mx-auto">
        <h1
          style={{ color: titleColor }}
          className="text-xl font-bold mb-6 px-1"
        >
          Reviews
        </h1>

        {reviews.length === 0 ? (
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
