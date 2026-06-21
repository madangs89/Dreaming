import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Mic, RefreshCcw, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Spinner from "../../components/Spinner";
import { useTheme } from "../../hooks/useTheme";
import {
  getAllTodayQuestions,
  getRevisionAttemptResults,
  submitRevisionAttempt,
} from "./revision.api";
import type { RevisionAttemptBody } from "./revision.types";


type Stage = "questions" | "results";

const RevisionAttempt = () => {
  const navigate = useNavigate();
  const { reviewId, topicId } = useParams<{
    reviewId: string;
    topicId: string;
  }>();

  const [theme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  const [stage, setStage] = useState<Stage>("questions");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [resultStageLoading, setResultStageLoading] = useState<boolean>(false);
  const [resultStageResults, setResultStageResults] =
    useState<RevisionAttemptBody | null>(null);

  const [resultStageError, setResultStageError] = useState<{
    isError: boolean;
    error: string;
  } | null>({
    error: "",
    isError: false,
  });

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const hasShownSuccessToast = useRef(false);

  const questionsQuery = useQuery({
    queryKey: ["revision-questions", reviewId],
    queryFn: () => getAllTodayQuestions({ review_Id: reviewId! }),
    enabled: !!reviewId,
    retry: 3,
  });

  const revisionAttemptPollingQuery = useQuery({
    queryKey: ["revision-attempt", attemptId],
    queryFn: () => getRevisionAttemptResults({ attemptId: attemptId! }),
    enabled: !!attemptId,
    refetchInterval: (data) => {
      if (!data?.success) return false;
      return data.attempt?.status === "completed" ? false : 2000;
    },
  });

  useEffect(() => {
    if (revisionAttemptPollingQuery.isError) {
      toast.error("Unable To Fetch Results!! Please Try again Later");
      setResultStageLoading(false);
      setResultStageError({
        isError: true,
        error: "Unable To Fetch Results!! Please Try again Later",
      });
      setAttemptId(null);
    }
    if (
      revisionAttemptPollingQuery.isSuccess &&
      revisionAttemptPollingQuery.data?.success
    ) {
      const attemptData = revisionAttemptPollingQuery.data.attempt;
      if (attemptData?.status === "completed") {
        if (!hasShownSuccessToast.current) {
          hasShownSuccessToast.current = true;

          toast.success("Revision evaluated successfully");
        }
        setResultStageResults(attemptData);
        setResultStageLoading(false);
        setAttemptId(null);
      } else if (attemptData?.status === "failed") {
        if (!hasShownSuccessToast.current) {
          hasShownSuccessToast.current = true;
          toast.error("Failed to evaluate revision");
        }
        setResultStageError({
          isError: true,
          error: "Failed to evaluate revision",
        });
        setResultStageLoading(false);
        setAttemptId(null);
      }
    }
  }, [
    revisionAttemptPollingQuery.isError,
    revisionAttemptPollingQuery.data,
    revisionAttemptPollingQuery.isSuccess,
  ]);

  const revisionQuestions = questionsQuery.data || [];
  useEffect(() => {
    if (questionsQuery.isError) {
      toast.error("Unable To Fetch Questions!! Please Try again Later");
    }
  }, [questionsQuery.isError]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const {
    bg,
    cardBg,
    cardBorder,
    subtleText,
    titleColor,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    pillBg,
    pillText,
    successColor,
    dangerColor,
    successBg,
    dangerBg,
    recordIdleBg,
    recordActiveBg,
    progressTrack,
    progressFill,
    dividerColor,
  } = useTheme(theme);

  const totalQuestions = revisionQuestions.length;
  const currentQuestion = revisionQuestions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasAnsweredCurrent = currentQuestion
    ? answeredIds.has(currentQuestion.id)
    : false;
  const noQuestionsAvailable =
    !questionsQuery.isLoading &&
    (questionsQuery.isError || revisionQuestions.length === 0);

  const handleToggleRecording = async () => {
    if (!isRecording) {
      resetTranscript();

      await SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });

      setIsRecording(true);
    } else {
      SpeechRecognition.stopListening();
      setIsRecording(false);
      if (transcript && transcript.trim() !== "") {
        setAnsweredIds((prev) => new Set([...prev, currentQuestion.id]));
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: transcript,
        }));
      }
    }
  };

  const revisionAttemptMutation = useMutation({
    mutationFn: submitRevisionAttempt,
    onSuccess: (data) => {
      hasShownSuccessToast.current = false;
      setAttemptId(data.id);
      setResultStageLoading(true);
      setStage("results");
    },
    onError: () => {
      toast.error("Failed to submit answers! Please try again.");
      setResultStageLoading(false);
      setAttemptId(null);
      setResultStageError({
        isError: true,
        error: "Failed to submit answers! Please try again.",
      });
    },
  });

  const handleNext = () => {
    if (isLastQuestion) {
      const allValues = Object.values(answers);
      const hasEmpty = allValues.some((val) => !val || val.trim() === "");

      if (hasEmpty) {
        toast.error("Please Answer All Questions!!");
        return;
      }

      revisionAttemptMutation.mutate({
        answers,
        reviewId: reviewId!,
      });
    } else {
      resetTranscript();
      setCurrentIndex((i) => i + 1);
    }
  };

  // Retry handler — resets error/loading state and re-triggers submission
  const handleRetrySubmit = () => {
    setResultStageError({ isError: false, error: "" });
    setResultStageLoading(true);
    revisionAttemptMutation.mutate({
      answers,
      reviewId: reviewId!,
    });
  };

  if (!browserSupportsSpeechRecognition) {
    alert(
      "Your browser does not support speech recognition. Please use a compatible browser.",
    );
    return null;
  }

  if (questionsQuery.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (noQuestionsAvailable) {
    return (
      <div
        style={{ backgroundColor: bg }}
        className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md">
          <div
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="rounded-2xl border p-8 shadow-sm flex flex-col items-center text-center gap-4"
          >
            <div
              style={{ backgroundColor: dangerBg, color: dangerColor }}
              className="h-14 w-14 rounded-full flex items-center justify-center"
            >
              <RefreshCcw className="h-6 w-6" />
            </div>
            <div>
              <h2
                style={{ color: titleColor }}
                className="text-lg font-semibold mb-1.5"
              >
                Unable to fetch questions
              </h2>
              <p style={{ color: subtleText }} className="text-sm">
                {questionsQuery.isError
                  ? "Something went wrong while loading today's revision questions."
                  : "There are no revision questions available right now."}
              </p>
            </div>
            <button
              onClick={() => questionsQuery.refetch()}
              disabled={questionsQuery.isRefetching}
              style={{
                backgroundColor: primaryBtnBg,
                color: primaryBtnText,
                opacity: questionsQuery.isRefetching ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!questionsQuery.isRefetching)
                  e.currentTarget.style.backgroundColor = primaryBtnHover;
              }}
              onMouseLeave={(e) => {
                if (!questionsQuery.isRefetching)
                  e.currentTarget.style.backgroundColor = primaryBtnBg;
              }}
              className="w-full rounded-xl py-3 font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <RefreshCcw
                className={`h-4 w-4 ${questionsQuery.isRefetching ? "animate-spin" : ""}`}
              />
              {questionsQuery.isRefetching ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "questions") {
    const currentTranscriptText =
      transcript || answers[currentQuestion.id] || "";

    return (
      <div
        style={{ backgroundColor: bg }}
        className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                if (currentIndex === 0) {
                  return;
                } else {
                  resetTranscript();
                  setCurrentIndex((i) => i - 1);
                }
              }}
              style={{ color: subtleText }}
              className="flex items-center justify-center h-8 w-8 rounded-full transition-colors hover:opacity-70"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              style={{ backgroundColor: progressTrack }}
              className="flex-1 h-1.5 rounded-full overflow-hidden"
            >
              <div
                style={{
                  backgroundColor: progressFill,
                  width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
            <span
              style={{ color: subtleText }}
              className="text-xs font-medium whitespace-nowrap"
            >
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Question card */}
          <div
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="rounded-2xl border p-6 sm:p-8 shadow-sm w-full h-full"
          >
            <span
              style={{ backgroundColor: pillBg, color: pillText }}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide mb-5"
            >
              {currentQuestion.difficulty}
            </span>

            <div className="w-full h-44 overflow-y-scroll">
              <h2
                style={{ color: titleColor }}
                className="text-xl sm:text-2xl font-semibold leading-snug mb-10"
              >
                {currentQuestion.question}
              </h2>
            </div>

            {/* Voice input — no text input by design */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <button
                onClick={handleToggleRecording}
                style={{
                  backgroundColor: isRecording ? recordActiveBg : recordIdleBg,
                }}
                className="h-20 w-20 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md shrink-0"
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <Square className="h-7 w-7 text-white" fill="white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </button>
              <p style={{ color: subtleText }} className="text-sm">
                {isRecording
                  ? "Listening… tap to stop"
                  : hasAnsweredCurrent
                    ? "Answer recorded — tap to re-record"
                    : "Tap to answer by voice"}
              </p>
              {currentTranscriptText && (
                <div
                  style={{
                    backgroundColor: progressTrack,
                    borderColor: cardBorder,
                  }}
                  className="w-full max-h-20 overflow-y-auto rounded-xl border px-4 py-3"
                >
                  <p
                    style={{ color: subtleText }}
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                  >
                    {currentTranscriptText}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={
                !hasAnsweredCurrent || revisionAttemptMutation.isPending
              }
              style={{
                backgroundColor: primaryBtnBg,
                color: primaryBtnText,
                opacity: hasAnsweredCurrent ? 1 : 0.4,
              }}
              onMouseEnter={(e) => {
                if (hasAnsweredCurrent)
                  e.currentTarget.style.backgroundColor = primaryBtnHover;
              }}
              onMouseLeave={(e) => {
                if (hasAnsweredCurrent)
                  e.currentTarget.style.backgroundColor = primaryBtnBg;
              }}
              className="w-full flex items-center justify-center rounded-xl py-3.5 font-semibold text-base transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {revisionAttemptMutation.isPending ? (
                <Spinner />
              ) : isLastQuestion ? (
                "Submit Revision"
              ) : (
                "Next Question"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div
        style={{ backgroundColor: bg }}
        className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md">
          {/* Loading state — waiting on AI evaluation */}
          {resultStageLoading && (
            <div
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              className="rounded-2xl border p-8 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[260px]"
            >
              <Spinner />
              <p style={{ color: subtleText }} className="text-sm font-medium">
                Evaluating your answers…
              </p>
            </div>
          )}

          {/* Error state — failed submit / failed evaluation / polling error */}
          {!resultStageLoading && resultStageError?.isError && (
            <div
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              className="rounded-2xl border p-8 shadow-sm flex flex-col items-center text-center gap-4"
            >
              <div
                style={{ backgroundColor: dangerBg, color: dangerColor }}
                className="h-14 w-14 rounded-full flex items-center justify-center"
              >
                <RefreshCcw className="h-6 w-6" />
              </div>
              <div>
                <h2
                  style={{ color: titleColor }}
                  className="text-lg font-semibold mb-1.5"
                >
                  Something went wrong
                </h2>
                <p style={{ color: subtleText }} className="text-sm">
                  {resultStageError.error ||
                    "We couldn't evaluate your revision. Please try again."}
                </p>
              </div>
              <button
                onClick={handleRetrySubmit}
                disabled={revisionAttemptMutation.isPending}
                style={{
                  backgroundColor: primaryBtnBg,
                  color: primaryBtnText,
                  opacity: revisionAttemptMutation.isPending ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!revisionAttemptMutation.isPending)
                    e.currentTarget.style.backgroundColor = primaryBtnHover;
                }}
                onMouseLeave={(e) => {
                  if (!revisionAttemptMutation.isPending)
                    e.currentTarget.style.backgroundColor = primaryBtnBg;
                }}
                className="w-full rounded-xl py-3 font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${revisionAttemptMutation.isPending ? "animate-spin" : ""}`}
                />
                {revisionAttemptMutation.isPending
                  ? "Resubmitting…"
                  : "Resubmit"}
              </button>
            </div>
          )}

          {/* Success state — show evaluation results */}
          {!resultStageLoading &&
            !resultStageError?.isError &&
            resultStageResults && (
              <div
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                className="rounded-2xl border p-6 sm:p-8 shadow-sm"
              >
                <p
                  style={{ color: subtleText }}
                  className="text-sm font-medium uppercase tracking-wide mb-2"
                >
                  Score
                </p>
                <h1
                  style={{ color: titleColor }}
                  className="text-5xl font-bold mb-8"
                >
                  {resultStageResults?.score}%
                </h1>

                {/* Strong areas */}
                <div className="mb-6">
                  <p
                    style={{ color: subtleText }}
                    className="text-xs font-semibold uppercase tracking-wide mb-3"
                  >
                    Strong Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resultStageResults?.strong_areas &&
                      resultStageResults?.strong_areas.map((area) => (
                        <span
                          key={area}
                          style={{
                            backgroundColor: successBg,
                            color: successColor,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                        >
                          ✓ {area}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Weak areas */}
                <div
                  style={{ borderColor: dividerColor }}
                  className="mb-8 pb-8 border-b"
                >
                  <p
                    style={{ color: subtleText }}
                    className="text-xs font-semibold uppercase tracking-wide mb-3"
                  >
                    Weak Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resultStageResults?.weak_areas &&
                      resultStageResults?.weak_areas.map((area) => (
                        <span
                          key={area}
                          style={{
                            backgroundColor: dangerBg,
                            color: dangerColor,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                        >
                          ✗ {area}
                        </span>
                      ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/notes/${topicId}`)}
                  style={{
                    backgroundColor: primaryBtnBg,
                    color: primaryBtnText,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = primaryBtnHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = primaryBtnBg)
                  }
                  className="w-full rounded-xl py-3.5 font-semibold text-base transition-colors duration-200"
                >
                  Review Notes
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }
};

export default RevisionAttempt;
