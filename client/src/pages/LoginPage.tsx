import { useState } from "react";

type LoginPageProps = {
  open: boolean;
  onClose: () => void;
};

const LoginPage = ({ open = false, onClose = () => {} }: LoginPageProps) => {
  const [isSignup, setIsSignup] = useState<boolean>(false);

  if (!open) return null;

  return (
    <div
      style={{
        fontFamily: "helveticRoman",
        zIndex: 100,
      }}
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl font-semibold tracking-wide">BOTIKA</h2>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-medium mb-2">
          {isSignup ? "Create account" : "Sign in"}
        </h1>

        <p className="text-gray-500 mb-6">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-black font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to Botika?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-black font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </p>

        {/* Name field only for signup */}
        {isSignup && (
          <input
            type="text"
            placeholder="Full name"
            className="w-full h-12 rounded-xl border border-gray-300 px-4 mb-3 outline-none focus:border-black"
          />
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-black"
        />

        {/* Password for signup */}
        {isSignup && (
          <input
            type="password"
            placeholder="Create password"
            className="w-full h-12 rounded-xl border border-gray-300 px-4 mt-3 outline-none focus:border-black"
          />
        )}

        {/* Continue */}
        <button className="w-full h-12 rounded-xl bg-black text-white font-medium mt-4 hover:opacity-90 transition">
          {isSignup ? "Create Account" : "Continue"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <button className="w-full h-12 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition">
          <img
            src="https://www.google.com/favicon.ico"
            alt="google"
            className="w-5 h-5"
          />
          <span>
            {isSignup ? "Sign up with Google" : "Sign in with Google"}
          </span>
        </button>

        {/* Apple */}
        <button className="w-full h-12 border border-gray-300 rounded-xl flex items-center justify-center gap-3 mt-3 hover:bg-gray-50 transition">
          <span className="text-xl"></span>
          <span>{isSignup ? "Sign up with Apple" : "Sign in with Apple"}</span>
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 leading-5 mt-6">
          By proceeding you acknowledge that you have read, understood and agree
          to our{" "}
          <a href="#" className="underline">
            Terms and Conditions
          </a>
          .
        </p>

        {/* Footer */}
        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-4 flex-wrap">
          <span>©2026 Botika</span>

          <a href="#" className="underline">
            Privacy Policy
          </a>

          <a href="#" className="underline">
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
