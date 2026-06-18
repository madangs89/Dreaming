import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, Square, ChevronLeft, FileText, Paperclip } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// ---------------------------------------------------------------------------
// STATIC / MOCK DATA — replace with real QuestionHistory + Note + Document data
// ---------------------------------------------------------------------------
const MOCK_QUESTIONS = [
  {
    id: "q1",
    question: "What problem does useEffect solve in React?",
    expectedAnswer:
      "useEffect lets you run side effects (data fetching, subscriptions, DOM mutations) after render, synchronized to specific dependency changes, replacing lifecycle methods from class components.",
    difficulty: "easy",
  },
  {
    id: "q2",
    question: "How do props differ from state?",
    expectedAnswer:
      "Props are read-only values passed from a parent to configure a child component. State is local, mutable data owned by a component that can change over time and triggers re-renders.",
    difficulty: "easy",
  },
  {
    id: "q3",
    question:
      "When would you reach for useMemo instead of recalculating a value directly?",
    expectedAnswer:
      "useMemo caches an expensive computation between renders, recalculating only when its dependencies change — useful for avoiding repeated expensive work, not for general optimization.",
    difficulty: "medium",
  },
  {
    id: "q4",
    question: "What is the purpose of useCallback?",
    expectedAnswer:
      "useCallback memoizes a function reference so it doesn't get recreated on every render, which matters when passing callbacks to memoized children or as effect dependencies.",
    difficulty: "medium",
  },
];

const MOCK_NOTE_CONTENT = `React Hooks Deep Dive

useEffect runs after the DOM updates and lets you synchronize a component with an external system (subscriptions, fetches, timers). Dependency array controls when it re-runs.

Props flow down from parent to child and are immutable from the child's perspective. State is local and owned by the component itself.

useMemo and useCallback both exist to skip expensive work between renders — useMemo memoizes a value, useCallback memoizes a function.`;

const MOCK_DOCUMENTS = [
  { id: "d1", title: "react-hooks-cheatsheet.pdf", memetype: "pdf" },
  { id: "d2", title: "useEffect-diagram.png", memetype: "image" },
];

// Mock result — TODO: replace with real AI evaluation response
const MOCK_RESULT = {
  score: 75,
  strongAreas: ["useEffect", "Props"],
  weakAreas: ["useMemo", "useCallback"],
};

type Stage = "questions" | "results" | "notes";

const RevisionAttempt = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams<{ reviewId: string }>();

  const [theme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  const [stage, setStage] = useState<Stage>("questions");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const totalQuestions = MOCK_QUESTIONS.length;
  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasAnsweredCurrent = answeredIds.has(currentQuestion?.id);

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
      setAnsweredIds((prev) => new Set([...prev, currentQuestion.id]));
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: transcript,
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      console.log(answers);
      setStage("results");
    } else {
      resetTranscript();
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBackToTopic = () => {
    navigate(`/revision/${reviewId}`);
  };

  if (!browserSupportsSpeechRecognition) {
    alert(
      "Your browser does not support speech recognition. Please use a compatible browser.",
    );
    return null;
  }

  // -------------------------------------------------------------------------
  // STAGE: QUESTIONS
  // -------------------------------------------------------------------------
  if (stage === "questions") {
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
            className="rounded-2xl border p-6 sm:p-8 shadow-sm"
          >
            <span
              style={{ backgroundColor: pillBg, color: pillText }}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide mb-5"
            >
              {currentQuestion.difficulty}
            </span>

            <h2
              style={{ color: titleColor }}
              className="text-xl sm:text-2xl font-semibold leading-snug mb-10"
            >
              {currentQuestion.question}
            </h2>

            {/* Voice input — no text input by design */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <button
                onClick={handleToggleRecording}
                style={{
                  backgroundColor: isRecording ? recordActiveBg : recordIdleBg,
                }}
                className="h-20 w-20 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md"
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
              <p style={{ color: subtleText }} className="text-sm">
                {transcript ? transcript : answers[currentQuestion.id]}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
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
              className="w-full rounded-xl py-3.5 font-semibold text-base transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? "Submit Revision" : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STAGE: RESULTS
  // -------------------------------------------------------------------------
  if (stage === "results") {
    return (
      <div
        style={{ backgroundColor: bg }}
        className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md">
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
              {MOCK_RESULT.score}%
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
                {MOCK_RESULT.strongAreas.map((area) => (
                  <span
                    key={area}
                    style={{ backgroundColor: successBg, color: successColor }}
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
                {MOCK_RESULT.weakAreas.map((area) => (
                  <span
                    key={area}
                    style={{ backgroundColor: dangerBg, color: dangerColor }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                  >
                    ✗ {area}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStage("notes")}
              style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
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
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STAGE: NOTES (original content + uploaded documents + expected answers)
  // -------------------------------------------------------------------------
  return (
    <div style={{ backgroundColor: bg }} className="min-h-screen w-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setStage("results")}
            style={{ color: subtleText }}
            className="flex items-center justify-center h-8 w-8 rounded-full transition-colors hover:opacity-70"
            aria-label="Back to results"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 style={{ color: titleColor }} className="text-2xl font-bold">
            Review Notes
          </h1>
        </div>

        {/* Original note content */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4" style={{ color: subtleText }} />
            <h2
              style={{ color: subtleText }}
              className="text-xs font-semibold uppercase tracking-wide"
            >
              Original Note Content
            </h2>
          </div>
          <div
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="rounded-2xl border p-5 sm:p-6"
          >
            <p
              style={{ color: titleColor }}
              className="text-sm leading-relaxed whitespace-pre-line"
            >
              {MOCK_NOTE_CONTENT}
            </p>
          </div>
        </section>

        {/* Uploaded documents */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="h-4 w-4" style={{ color: subtleText }} />
            <h2
              style={{ color: subtleText }}
              className="text-xs font-semibold uppercase tracking-wide"
            >
              Uploaded Documents
            </h2>
          </div>
          <div
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            className="rounded-2xl border divide-y"
          >
            {MOCK_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                style={{ borderColor: dividerColor }}
                className="flex items-center gap-3 p-4"
              >
                <FileText
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: subtleText }}
                />
                <span
                  style={{ color: titleColor }}
                  className="text-sm truncate"
                >
                  {doc.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Questions + expected answers */}
        <section className="mb-8">
          <h2
            style={{ color: subtleText }}
            className="text-xs font-semibold uppercase tracking-wide mb-3"
          >
            Expected Answers
          </h2>
          <div className="flex flex-col gap-3">
            {MOCK_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                className="rounded-2xl border p-5"
              >
                <p
                  style={{ color: titleColor }}
                  className="text-sm font-semibold mb-2"
                >
                  {idx + 1}. {q.question}
                </p>
                <p
                  style={{ color: subtleText }}
                  className="text-sm leading-relaxed"
                >
                  {q.expectedAnswer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={handleBackToTopic}
          style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = primaryBtnHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = primaryBtnBg)
          }
          className="w-full rounded-xl py-3.5 font-semibold text-base transition-colors duration-200 mb-4"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default RevisionAttempt;
