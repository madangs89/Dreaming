import { useState, useRef } from "react";
import HeroImage from "../assets/heroimage.png";
import HeroVedio from "../assets/herovedio.mp4";
import LoginPage from "./LoginPage";

const faqs = [
  {
    q: "Do I need to manually create a revision schedule?",
    a: "No. The moment a note has real content, a review is scheduled automatically. You don't set dates, intervals, or reminders yourself.",
  },
  {
    q: "What happens if I edit a note after a review is already scheduled?",
    a: "We check how much the content changed. Small edits are ignored. Major changes reschedule the review and regenerate the quiz so it always matches your latest material.",
  },
  {
    q: "Can I upload PDFs, Word docs, or images?",
    a: "Yes. Text is extracted automatically — including OCR for images — and becomes part of your searchable, chattable learning material.",
  },
  {
    q: "How does the AI decide when to quiz me again?",
    a: "Based on your score. Strong performance pushes your next review further out (up to 7 days). Weak performance brings it back sooner (as little as 12 hours).",
  },
];

const LandingPage = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full h-screen bg-white overflow-y-scroll">
      {/* HERO SECTION */}
      <div className="w-full relative min-h-screen flex items-center bg-white overflow-hidden lg:px-12 p-7">
        <nav
          style={{ fontFamily: "helveticRoman", zIndex: 100 }}
          className="w-full h-fit flex overflow-hidden lg:px-12 items-center justify-between absolute top-3 right-0 px-2"
        >
          <div className="flex items-center justify-center gap-3">
            <h3 className="font-bold  text-black text-2xl">OVERTHINK</h3>
            {["Home", "Features", "Pricing", "Contact"].map((item) => (
              <span
                key={item}
                onClick={() => {
                  if (item === "Features") scrollToFeatures();
                }}
                className="ml-8 :block hidden text-[15px] text-[#0c0c0c] hover:text-[#666] transition-colors duration-300 cursor-pointer"
              >
                {item}
              </span>
            ))}
          </div>

          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-4"
          >
            <button
              className="px-8 py-3 bg-[#313131]
                        tracking-[0.1rem]
            font-semibold
            text-white rounded-md text-[14px]  hover:bg-[#424242] transition-colors duration-300"
            >
              Get Started
            </button>
          </div>
        </nav>

        <div
          style={{ fontFamily: "helveticRoman", zIndex: 100 }}
          className="w-full flex md:h-[500px] my-5 relative h-fit md:mt-10"
        >
          <div className="flex-1 my-auto flex-shrink-0 mt-12 lg:mt-8">
            {" "}
            <p
              style={{ letterSpacing: "-0.288rem", color: "#0c0c0c" }}
              className="text-7xl  w-full flex flex-col "
            >
              <span style={{ letterSpacing: "-0.112rem", color: "#666" }}>
                You learn it.
              </span>{" "}
              We make sure you
              <br /> remember it.
            </p>
            <p
              className="my-6 w-full lg:text-[15px] text-[10px]"
              style={{
                fontFamily: "helveticRoman",
                letterSpacing: "0.1rem",
                color: "#666",
              }}
            >
              Every article you read, every video you watch, every course you
              take — most of it disappears within days. We captures everything
              you learn, builds your revision schedule, and makes sure it
              actually sticks."
            </p>
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={scrollToFeatures}
                className="px-8 py-3 bg-[#dbdbdb]
              tracking-[0.1rem]
            font-[600]
            text-black rounded-md text-[14px]  hover:bg-[#BFBFBF] transition-colors duration-300"
              >
                See How It Works
              </button>
              <div
                style={{ color: "#666" }}
                className="text-[13px] tracking-[0.05rem] flex items-center gap-2"
              >
                {/* <span className="w-2 h-2 rounded-full bg-[#313131] inline-block" /> */}
          
              </div>
            </div>
          </div>

          <div style={{ zIndex: 90 }} className="w-1/2 h-full lg:block hidden">
            <video
              src={HeroVedio}
              autoPlay
              loop
              muted
              className="w-full h-[450px] object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        <LoginPage open={open} onClose={() => setOpen(false)} />
      </div>

      {/* PROBLEM FRAMING */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-[#0c0c0c] px-7 lg:px-12 py-16"
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            style={{ letterSpacing: "-0.1rem" }}
            className="text-white text-3xl lg:text-4xl font-semibold"
          >
            Learning isn't the hard part. Remembering is.
          </p>
          <p
            style={{ color: "#999", letterSpacing: "0.05rem" }}
            className="mt-4 text-[14px] lg:text-[15px] leading-relaxed"
          >
            Research on memory consistently shows that most new information
            fades within days unless it's deliberately reinforced. Most people
            never build that reinforcement loop — not because they're lazy, but
            because tracking what to revisit, and when, is its own job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            {
              label: "Without a system",
              desc: "You read it once. A week later, it's gone.",
            },
            {
              label: "With flashcards",
              desc: "You have to remember to make them, and to review them.",
            },
            {
              label: "With Overthink",
              desc: "We track it, schedule it, quiz you, and adapt — automatically.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-[#2a2a2a] rounded-xl p-5"
            >
              <p className="text-white font-semibold text-[15px]">
                {item.label}
              </p>
              <p
                style={{ color: "#999" }}
                className="text-[13px] mt-2 leading-relaxed"
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div
        ref={featuresRef}
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-white px-7 lg:px-12 py-20"
      >
        <p
          style={{ letterSpacing: "-0.1rem", color: "#0c0c0c" }}
          className="text-4xl lg:text-5xl font-semibold text-center"
        >
          How it actually works
        </p>
        <p
          style={{ color: "#666", letterSpacing: "0.05rem" }}
          className="text-center mt-4 max-w-xl mx-auto text-[14px] lg:text-[15px]"
        >
          No flashcards to make. No schedule to manage. We handle the entire
          memory loop for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {[
            {
              step: "01",
              title: "Capture what you learn",
              desc: "Write notes or upload PDFs, docs, and images. We extract and organize the content automatically.",
            },
            {
              step: "02",
              title: "We schedule your revision",
              desc: "The moment your notes have real content, a revision is scheduled — no setup required.",
            },
            {
              step: "03",
              title: "Answer AI-generated quizzes",
              desc: "Right before each review, AI generates questions from your own material to test real understanding.",
            },
            {
              step: "04",
              title: "We adapt to your performance",
              desc: "Score well and your next review moves further out. Struggle, and we bring it back sooner.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border border-[#e5e5e5] rounded-xl p-6 hover:shadow-md transition-shadow duration-300"
            >
              <p style={{ color: "#bbb" }} className="text-3xl font-bold mb-4">
                {item.step}
              </p>
              <p
                style={{ color: "#0c0c0c" }}
                className="text-lg font-semibold mb-2"
              >
                {item.title}
              </p>
              <p
                style={{ color: "#666" }}
                className="text-[13px] lg:text-[14px] leading-relaxed"
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-[#fafafa] px-7 lg:px-12 py-20"
      >
        <p
          style={{ letterSpacing: "-0.1rem", color: "#0c0c0c" }}
          className="text-4xl lg:text-5xl font-semibold text-center"
        >
          Everything you need to retain it
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto">
          {[
            {
              title: "Notes, organized by topic",
              desc: "Create, edit, and group notes into topics so your learning material stays structured as it grows.",
            },
            {
              title: "Upload anything",
              desc: "PDFs, Word docs, and images — we extract the text (with OCR for images) so it becomes part of your study material instantly.",
            },
            {
              title: "Chat with your own notes",
              desc: "Ask for explanations, summaries, or examples. Answers are grounded in exactly what you've written and uploaded.",
            },
            {
              title: "AI-generated quizzes",
              desc: "Right before each review, AI checks if your material is revision-worthy and generates targeted questions from it.",
            },
            {
              title: "Real evaluation, not just scoring",
              desc: "Every answer is assessed for correctness and understanding, with strong areas and weak areas called out clearly.",
            },
            {
              title: "Adaptive spaced repetition",
              desc: "Every quiz result reshapes your next revision date — strong performance pushes it out, weak performance brings it closer.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-[#e5e5e5] rounded-xl p-6"
            >
              <p
                style={{ color: "#0c0c0c" }}
                className="text-lg font-semibold mb-2"
              >
                {feature.title}
              </p>
              <p
                style={{ color: "#666" }}
                className="text-[13px] lg:text-[14px] leading-relaxed"
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BUILT FOR */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-white px-7 lg:px-12 py-20"
      >
        <p
          style={{ letterSpacing: "-0.1rem", color: "#0c0c0c" }}
          className="text-4xl lg:text-5xl font-semibold text-center"
        >
          Built for anyone trying to retain something
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto">
          {[
            {
              title: "Students",
              desc: "Turn lecture notes and textbook chapters into a revision schedule that runs itself before exams.",
            },
            {
              title: "Professionals",
              desc: "Retain what you learn from courses, certifications, and technical docs without manually scheduling reviews.",
            },
            {
              title: "Lifelong learners",
              desc: "Read something worth remembering? Drop it in. We'll make sure it doesn't just disappear in a week.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-6 bg-[#fafafa] border border-[#e5e5e5]"
            >
              <p
                style={{ color: "#0c0c0c" }}
                className="font-semibold text-lg mb-2"
              >
                {item.title}
              </p>
              <p
                style={{ color: "#666" }}
                className="text-[13px] lg:text-[14px] leading-relaxed"
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-[#fafafa] px-7 lg:px-12 py-20"
      >
        <p
          style={{ letterSpacing: "-0.1rem", color: "#0c0c0c" }}
          className="text-4xl lg:text-5xl font-semibold text-center"
        >
          Questions, answered
        </p>

        <div className="max-w-2xl mx-auto mt-12 flex flex-col gap-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className="bg-white border border-[#e5e5e5] rounded-xl px-5 py-4 cursor-pointer"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <p
                    style={{ color: "#0c0c0c" }}
                    className="font-medium text-[15px]"
                  >
                    {item.q}
                  </p>
                  <span
                    style={{ color: "#666" }}
                    className="text-lg leading-none"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                {isOpen && (
                  <p
                    style={{ color: "#666" }}
                    className="text-[13px] lg:text-[14px] leading-relaxed mt-3"
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FINAL CTA */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-white px-7 lg:px-12 py-24 flex flex-col items-center text-center"
      >
        <p
          style={{ letterSpacing: "-0.15rem", color: "#0c0c0c" }}
          className="text-4xl lg:text-6xl font-semibold max-w-2xl"
        >
          Stop forgetting what you learn.
        </p>
        <p
          style={{ color: "#666", letterSpacing: "0.05rem" }}
          className="mt-4 max-w-md text-[14px] lg:text-[15px]"
        >
          Start a note today. We'll handle the rest.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-8 px-8 py-3 bg-[#313131]
                    tracking-[0.1rem]
          font-semibold
          text-white rounded-md text-[14px] hover:bg-[#424242] transition-colors duration-300"
        >
          Get Started
        </button>
      </div>

      {/* FOOTER */}
      <div
        style={{ fontFamily: "helveticRoman" }}
        className="w-full bg-[#0c0c0c] px-7 lg:px-12 py-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <h3 className="font-bold text-white text-xl">OVERTHINK</h3>
          <div
            className="flex items-center gap-6 text-[13px]"
            style={{ color: "#999" }}
          >
            <span className="cursor-pointer hover:text-white transition-colors">
              Home
            </span>
            <span
              onClick={scrollToFeatures}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Features
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              Pricing
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              Contact
            </span>
          </div>
        </div>
        <p style={{ color: "#555" }} className="text-center text-[12px] mt-8">
          © {new Date().getFullYear()} Overthink. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
