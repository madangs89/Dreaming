import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  BookOpen,
  Loader2,
  Send,
  Sparkles,
  User,
  X,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isBasedOnMaterial?: boolean;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  /** Required by the backend route POST /api/v1/chatbot/conversation/:id */
  noteId?: string;
  /** The currently open note's title, shown as context in the header */
  noteTitle?: string;
}

interface ConversationHistoryItem {
  role: string;
  content: string;
}

interface ConversationResponse {
  message: string;
  success: boolean;
  data: {
    answer: string;
    isBasedOnMaterial: boolean;
  };
  source: unknown[];
}

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Matches the controller in chatbot.controller.ts — POST /api/v1/chatbot/conversation/:id */
const postConversation = async ({
  noteId,
  query,
  history,
}: {
  noteId: string;
  query: string;
  history: ConversationHistoryItem[];
}): Promise<ConversationResponse> => {
  const response = await axios.post<ConversationResponse>(
    `${import.meta.env.VITE_BACKEND_URL}/api/v1/chatbot/conversation/${noteId}`,
    { query, history },
    { withCredentials: true },
  );
  return response.data;
};

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  theme,
  noteId,
  noteTitle,
}) => {
  const isDark = theme === "dark";
  const {
    bg,
    sidebarBg,
    sidebarBorder,
    sidebarHeaderText,
    sidebarCloseText,
    sidebarCloseHover,
    dividerColor,
    titleColor,
    subtleText,
    cardBorder,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    pillBg,
    pillText,
    backdropBg,
    menuBtnBg,
    menuBtnBgHover,
    menuBtnText,
  } = useTheme(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const conversationMutation = useMutation({
    mutationFn: postConversation,
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: response.data.answer,
          createdAt: new Date(),
          isBasedOnMaterial: response.data.isBasedOnMaterial,
        },
      ]);
    },
    onError: (error) => {
      console.error("Error in chatbot conversation:", error);
      toast.error("Failed to get a response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "_Sorry, something went wrong. Please try again._",
          createdAt: new Date(),
        },
      ]);
    },
  });

  const isSending = conversationMutation.isPending;

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Reset the thread whenever the modal is opened for a different note
  useEffect(() => {
    setMessages([]);
    conversationMutation.reset();
  }, [noteId]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (!noteId) {
      toast.error("Please open or save a note before chatting.");
      return;
    }
    const history: ConversationHistoryItem[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    requestAnimationFrame(autoResize);

    conversationMutation.mutate({ noteId, query: trimmed, history });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    conversationMutation.reset();
  };

  if (!isOpen) return null;

  const canChat = Boolean(noteId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ backgroundColor: backdropBg }}
        className="absolute inset-0 backdrop-blur-[2px]"
      />

      {/* Modal panel */}
      <div
        style={{ backgroundColor: sidebarBg, borderColor: sidebarBorder }}
        className="
          relative z-10 flex w-full flex-col overflow-hidden
          border shadow-2xl
          h-full sm:h-[85vh] sm:max-h-[720px]
          sm:w-full sm:max-w-2xl
          sm:rounded-2xl
          animate-[fadeIn_0.15s_ease-out]
        "
      >
        {/* Header */}
        <div
          style={{ borderColor: sidebarBorder }}
          className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            >
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2
                style={{ color: sidebarHeaderText }}
                className="text-base font-semibold leading-tight"
              >
                AI Assistant
              </h2>
              {noteTitle ? (
                <p
                  style={{ color: subtleText }}
                  className="truncate text-xs leading-tight"
                >
                  Chatting about “{noteTitle}”
                </p>
              ) : (
                <p style={{ color: subtleText }} className="text-xs leading-tight">
                  No note selected
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                title="Start a new chat"
                style={{ backgroundColor: menuBtnBg, color: menuBtnText }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = menuBtnBgHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = menuBtnBg)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Close"
              style={{ color: sidebarCloseText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = sidebarCloseHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = sidebarCloseText)
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
        >
          {!canChat ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div
                style={{ backgroundColor: pillBg, color: pillText }}
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              >
                <Sparkles className="h-6 w-6" />
              </div>
              <h3
                style={{ color: titleColor }}
                className="text-lg font-semibold"
              >
                No note selected
              </h3>
              <p style={{ color: subtleText }} className="mt-1 max-w-xs text-sm">
                Open or save a note first — the assistant answers based on
                that note's content.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div
                style={{ backgroundColor: pillBg, color: pillText }}
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              >
                <Sparkles className="h-6 w-6" />
              </div>
              <h3
                style={{ color: titleColor }}
                className="text-lg font-semibold"
              >
                Ask me anything
              </h3>
              <p style={{ color: subtleText }} className="mt-1 max-w-xs text-sm">
                I can help you summarize, brainstorm, or answer questions about
                “{noteTitle}”.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${
                      isUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      style={{
                        backgroundColor: isUser ? primaryBtnBg : pillBg,
                        color: isUser ? primaryBtnText : pillText,
                      }}
                      className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                    >
                      {isUser ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        style={{
                          backgroundColor: isUser ? primaryBtnBg : pillBg,
                          color: isUser ? primaryBtnText : titleColor,
                        }}
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
                        }`}
                      >
                        {isUser ? (
                          <span className="whitespace-pre-wrap">
                            {message.content}
                          </span>
                        ) : (
                          <MarkdownMessage
                            content={message.content}
                            linkColor={primaryBtnHover}
                            codeBg={isDark ? "#1f1f1f" : "#ffffff"}
                            codeBorder={cardBorder}
                          />
                        )}
                      </div>

                      {!isUser && message.isBasedOnMaterial && (
                        <span
                          style={{ color: subtleText }}
                          className="flex items-center gap-1 px-1 text-[11px]"
                        >
                          <BookOpen className="h-3 w-3" />
                          Based on your note
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-2.5">
                  <div
                    style={{ backgroundColor: pillBg, color: pillText }}
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div
                    style={{ backgroundColor: pillBg }}
                    className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3"
                  >
                    <span
                      style={{ backgroundColor: subtleText }}
                      className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"
                    />
                    <span
                      style={{ backgroundColor: subtleText }}
                      className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"
                    />
                    <span
                      style={{ backgroundColor: subtleText }}
                      className="h-1.5 w-1.5 animate-bounce rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{ borderColor: dividerColor, backgroundColor: sidebarBg }}
          className="border-t px-3 py-3 sm:px-4 sm:py-4"
        >
          <div
            style={{
              backgroundColor: bg,
              borderColor: cardBorder,
              opacity: canChat ? 1 : 0.6,
            }}
            className="flex items-end gap-2 rounded-2xl border px-3 py-2"
          >
            <textarea
              ref={textareaRef}
              value={input}
              disabled={!canChat}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                canChat ? "Ask the AI assistant..." : "Open a note to chat..."
              }
              rows={1}
              style={{ color: titleColor }}
              className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-current placeholder:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!canChat || !input.trim() || isSending}
              style={{
                backgroundColor: primaryBtnBg,
                color: primaryBtnText,
                opacity: !canChat || !input.trim() || isSending ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!canChat || !input.trim() || isSending) return;
                e.currentTarget.style.backgroundColor = primaryBtnHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryBtnBg;
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p style={{ color: subtleText }} className="mt-1.5 px-1 text-[11px]">
            Press Enter to send, Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
};

/** Themed wrapper around ReactMarkdown so assistant replies pick up the app's colors */
const MarkdownMessage: React.FC<{
  content: string;
  linkColor: string;
  codeBg: string;
  codeBorder: string;
}> = ({ content, linkColor, codeBg, codeBorder }) => {
  return (
    <div className="space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: linkColor }}
              className="underline underline-offset-2"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-bold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{ borderColor: codeBorder }}
              className="border-l-2 pl-3 italic opacity-80"
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className="block font-mono text-[13px]">
                  {children}
                </code>
              );
            }
            return (
              <code
                style={{ backgroundColor: codeBg, borderColor: codeBorder }}
                className="rounded-md border px-1.5 py-0.5 font-mono text-[13px]"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              style={{ backgroundColor: codeBg, borderColor: codeBorder }}
              className="overflow-x-auto rounded-lg border p-3"
            >
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ChatbotModal;