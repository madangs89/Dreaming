import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import Switch from "react-switch";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNoteOnlyTitle,
  fetchAllNotes,
  getSingleNote,
  updateNoteContent,
  updateNoteTitle,
} from "./notes.api";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createNote,
  getNote,
  retryWrapper,
  updateNoteContentIndexDB,
  updateNoteTitleIndexDB,
} from "../../indexdb/db.helper";
import Spinner from "../../components/Spinner";
import axios from "axios";
import type { DocumentBody } from "./notes.type";
import { Trash, Files } from "lucide-react";

// Random files data for the files sidebar
const MOCK_FILES = [
  {
    id: "1",
    name: "roadmap-v3.pdf",
    size: "420 KB",
    type: "pdf",
    updatedAt: new Date("2026-06-14T10:32:00"),
  },
  {
    id: "2",
    name: "wireframes.png",
    size: "1.2 MB",
    type: "image",
    updatedAt: new Date("2026-06-13T16:15:00"),
  },
  {
    id: "3",
    name: "q3-metrics.xlsx",
    size: "88 KB",
    type: "sheet",
    updatedAt: new Date("2026-06-12T09:00:00"),
  },
  {
    id: "4",
    name: "design-brief.docx",
    size: "210 KB",
    type: "doc",
    updatedAt: new Date("2026-06-10T19:44:00"),
  },
  {
    id: "5",
    name: "brand-assets.zip",
    size: "5.6 MB",
    type: "zip",
    updatedAt: new Date("2026-06-08T14:03:00"),
  },
  {
    id: "6",
    name: "contract-draft.pdf",
    size: "340 KB",
    type: "pdf",
    updatedAt: new Date("2026-06-07T11:20:00"),
  },
  {
    id: "7",
    name: "user-research.xlsx",
    size: "150 KB",
    type: "sheet",
    updatedAt: new Date("2026-06-05T08:55:00"),
  },
];

const fileIcon = (type: string, isDark: boolean) => {
  const color = isDark ? "#a1a1aa" : "#71717a";
  switch (type) {
    case "pdf":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      );
    case "image":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "sheet":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="8" y1="9" x2="10" y2="9" />
        </svg>
      );
    case "zip":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    default:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
};

const Notes = () => {
  const queryClient = useQueryClient();

  const { topicId } = useParams<{ topicId: string }>();

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const debounceTimerRef = useRef<number | null>(null);
  const debounceContentTimerRef = useRef<number | null>(null);
  const isLoadingNoteRef = useRef(false);

  const [currentNoteId, setCurrentNoteId] = useState<string>(() => {
    try {
      const storedNoteIds = JSON.parse(
        localStorage.getItem("currentNoteId") ?? "{}",
      );
      return storedNoteIds[topicId!] ?? "new";
    } catch {
      return "new";
    }
  });

  const [currentNoteTitle, setCurrentNoteTitle] = useState<string>("");

  const editor = useCreateBlockNote({
    uploadFile: async (file: File, blockId?: string) => {
      try {
        if (!currentNoteId || currentNoteId === "new") {
          const message = "Please save the note before uploading a file.";
          toast.error(message);
          throw new Error(message);
        }

        const formData = new FormData();
        formData.append("document", file);
        formData.append("notes_id", currentNoteId);

        const response = await axios.post<{ document: DocumentBody }>(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/documents/create`,
          formData,
          { withCredentials: true },
        );

        if (!response.data.document.url) {
          throw new Error("No file URL returned from server.");
        }

        return response.data.document.url;
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file! Please try again.");
        throw error;
      }
    },
  });
  console.log("t", editor._tiptapEditor.extensionStorage);

  console.log("dd" , editor._tiptapEditor.state);

  const notesQuery = useQuery({
    queryKey: ["notes", topicId],
    queryFn: () => fetchAllNotes({ id: topicId! }),
    enabled: !!topicId,
    retry: 3,
  });

  const notesList = notesQuery.data || [];

  useEffect(() => {
    if (notesQuery.isError) {
      toast.error("Failed to fetch notes! Please try again.");
    }
  }, [notesQuery.isError]);

  const singleNoteQuery = useQuery({
    queryKey: ["note", currentNoteId],
    queryFn: () => getSingleNote({ id: currentNoteId }),
    enabled: currentNoteId !== "new" && currentNoteId.length > 0,
    retry: 3,
  });

  useEffect(() => {
    if (singleNoteQuery.isError) {
      setCurrentNoteId("new");
      setCurrentNoteTitle("");
      toast.error("Failed to fetch the note! Please try again.");
    }
  }, [singleNoteQuery.isError]);

  const createNewNoteTitle = useMutation({
    mutationFn: createNoteOnlyTitle,
    onSuccess: async (data) => {
      if (
        currentNoteId === "new" ||
        currentNoteId === "" ||
        currentNoteId !== data.id
      ) {
        setCurrentNoteId(data.id);
        handleSaveToLocalStorage(data.id, topicId!);
      }
      setCurrentNoteTitle(data.title);
      await retryWrapper(() =>
        createNote({
          id: data.id,
          title: data.title,
          content: "[]",
          titleTimeStamp: new Date(data.titleTimeStamp),
          contentTimeStamp: new Date(data.titleTimeStamp),
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["notes", topicId] });
    },
    onError: () => {
      toast.error("Failed to create note! Please try again.");
    },
  });

  const updateNoteTitleMutation = useMutation({
    mutationFn: updateNoteTitle,
    onSuccess: async (data) => {
      if (
        currentNoteId === "new" ||
        currentNoteId === "" ||
        currentNoteId !== data.id
      ) {
        setCurrentNoteId(data.id);
        handleSaveToLocalStorage(data.id, topicId!);
      }
      setCurrentNoteTitle(data.title);
      queryClient.invalidateQueries({ queryKey: ["note", data.id] });
      queryClient.invalidateQueries({ queryKey: ["notes", topicId] });
    },
    onError: () => {
      toast.error("Failed to update note! Please try again.");
    },
  });

  const updateNoteContentMutation = useMutation({
    mutationFn: updateNoteContent,
    onSuccess: async (data) => {
      console.log("content mutation success");
    },
    onError: () => {
      toast.error("Failed to update note content! Please try again.");
    },
  });

  useEffect(() => {
    if (singleNoteQuery.isSuccess && singleNoteQuery.data) {
      console.log("effect running");
      (async () => {
        const storedData = await retryWrapper(() => getNote(currentNoteId));

        if (!singleNoteQuery.data) return;

        if (!storedData) {
          await retryWrapper(() =>
            createNote({
              id: singleNoteQuery.data.id,
              title: singleNoteQuery.data.title,
              content: singleNoteQuery.data.content || "[]",
              titleTimeStamp: new Date(singleNoteQuery.data.titleTimeStamp),
              contentTimeStamp: new Date(singleNoteQuery.data.contentTimeStamp),
            }),
          );
          setCurrentNoteTitle(singleNoteQuery.data.title);

          isLoadingNoteRef.current = true;
          editor.replaceBlocks(
            editor.document,
            JSON.parse(singleNoteQuery.data.content || "[]"),
          );
          setTimeout(() => {
            isLoadingNoteRef.current = false;
          }, 100);
          return;
        }

        const localTitleTimestamp =
          new Date(storedData.titleTimeStamp).getTime() / 1000;
        const serverTitleTimestamp =
          new Date(singleNoteQuery.data.titleTimeStamp).getTime() / 1000;

        if (localTitleTimestamp > serverTitleTimestamp) {
          setCurrentNoteTitle(storedData.title);
          updateNoteTitleMutation.mutate({
            id: currentNoteId,
            title: storedData.title,
            timeStamp: new Date(storedData.titleTimeStamp),
          });
        } else {
          setCurrentNoteTitle(singleNoteQuery.data.title);
          await retryWrapper(() =>
            updateNoteTitleIndexDB(
              currentNoteId,
              singleNoteQuery.data.title,
              new Date(singleNoteQuery.data.titleTimeStamp),
            ),
          );
        }

        const localContentTimestamp =
          new Date(storedData.contentTimeStamp).getTime() / 1000;
        const serverContentTimestamp =
          new Date(singleNoteQuery.data.contentTimeStamp).getTime() / 1000;

        let contentData: string;

        if (localContentTimestamp > serverContentTimestamp) {
          contentData = storedData.content;
          updateNoteContentMutation.mutate({
            id: currentNoteId,
            content: storedData.content,
            timeStamp: new Date(storedData.contentTimeStamp),
          });
        } else {
          contentData = singleNoteQuery.data.content;
          await retryWrapper(() =>
            updateNoteContentIndexDB(
              currentNoteId,
              singleNoteQuery.data.content,
              new Date(singleNoteQuery.data.contentTimeStamp),
            ),
          );
        }

        isLoadingNoteRef.current = true;
        editor.replaceBlocks(editor.document, JSON.parse(contentData || "[]"));
        setTimeout(() => {
          isLoadingNoteRef.current = false;
        }, 100);
      })();
    }
  }, [singleNoteQuery.isSuccess, singleNoteQuery.data]);

  const handleSaveToLocalStorage = (noteId: string, topicId: string) => {
    const storedNoteIds = JSON.parse(
      localStorage.getItem("currentNoteId") ?? "{}",
    );
    storedNoteIds[topicId!] = noteId;
    localStorage.setItem("currentNoteId", JSON.stringify(storedNoteIds));
  };

  const handleDebouncedTitleChange = async (
    newTitle: string,
    delay: number = 1000,
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      if (currentNoteId === "new") {
        createNewNoteTitle.mutate({
          title: newTitle,
          topic_id: topicId!,
          timeStamp: new Date(),
        });
      } else {
        const timeStamp = new Date();
        await retryWrapper(() =>
          updateNoteTitleIndexDB(currentNoteId, newTitle, timeStamp),
        );
        updateNoteTitleMutation.mutate({
          id: currentNoteId,
          title: newTitle,
          timeStamp,
        });
      }
    }, delay);
  };

  const handleDebouncedContentChange = async (
    newContent: string,
    delay: number = 1000,
  ) => {
    if (debounceContentTimerRef.current) {
      clearTimeout(debounceContentTimerRef.current);
    }
    debounceContentTimerRef.current = setTimeout(async () => {
      const timeStamp = new Date();
      await retryWrapper(() =>
        updateNoteContentIndexDB(currentNoteId, newContent, timeStamp),
      );
      updateNoteContentMutation.mutate({
        id: currentNoteId,
        content: newContent,
        timeStamp,
      });
    }, delay);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNoteTitle(e.target.value);
    handleDebouncedTitleChange(e.target.value);
  };

  const handleContentChange = () => {
    console.log("content change detected");
    if (isLoadingNoteRef.current) return;
    handleDebouncedContentChange(JSON.stringify(editor.document));
  };

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

  return (
    <div
      style={{ backgroundColor: bg }}
      className="relative h-screen overflow-hidden"
    >
      {/* Backdrop — closes whichever sidebar is open */}
      {(isNotesOpen || isFilesOpen) && (
        <div
          onClick={() => {
            setIsNotesOpen(false);
            setIsFilesOpen(false);
          }}
          style={{ backgroundColor: backdropBg }}
          className="absolute inset-0 backdrop-blur-[2px] z-40 transition-all"
        />
      )}

      {/* Left open button */}
      {!isNotesOpen && (
        <button
          onClick={() => setIsNotesOpen(true)}
          style={{ backgroundColor: menuBtnBg, color: menuBtnText }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = menuBtnBgHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = menuBtnBg)
          }
          className="absolute top-4 left-4 z-50 h-10 w-10 rounded-lg shadow-lg transition-all flex items-center justify-center"
        >
          ☰
        </button>
      )}

      {/* Right open button */}
      {!isFilesOpen && (
        <button
          onClick={() => setIsFilesOpen(true)}
          style={{ backgroundColor: menuBtnBg, color: menuBtnText }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = menuBtnBgHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = menuBtnBg)
          }
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-lg shadow-lg transition-all flex items-center justify-center"
        >
          <Files className="h-4 w-4" />
        </button>
      )}

      {/* Left Sidebar — Notes */}
      <aside
        style={{
          backgroundColor: sidebarBg,
          borderColor: sidebarBorder,
        }}
        className={`
          absolute left-0 top-0 h-full w-80
          border-r z-50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isNotesOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            style={{ borderColor: sidebarBorder }}
            className="flex items-center justify-between p-4 border-b"
          >
            <h2
              style={{ color: sidebarHeaderText }}
              className="text-lg font-semibold"
            >
              Notes
            </h2>
            <button
              onClick={() => setIsNotesOpen(false)}
              style={{ color: sidebarCloseText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = sidebarCloseHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = sidebarCloseText)
              }
              className="transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Create Note */}
          <div className="p-3">
            <button
              onClick={() => {
                setCurrentNoteId("new");
                setCurrentNoteTitle("");
                setIsNotesOpen(false);
                isLoadingNoteRef.current = true;
                editor.replaceBlocks(editor.document, []);
                setTimeout(() => {
                  isLoadingNoteRef.current = false;
                }, 100);
              }}
              style={{ backgroundColor: newNoteBtn, color: newNoteBtnText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = newNoteBtnHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = newNoteBtn)
              }
              className="w-full rounded-lg py-2.5 transition"
            >
              + New Note
            </button>
          </div>

          {/* Notes List */}
          {notesQuery.isLoading ? (
            <div className="flex-1 justify-center flex">
              <Spinner />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {notesList && notesList.length > 0 ? (
                notesList.map((note) => {
                  const isActive = currentNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => {
                        setCurrentNoteId(note.id);
                        handleSaveToLocalStorage(note.id, topicId!);
                        setIsNotesOpen(false);
                      }}
                      style={{
                        backgroundColor: isActive
                          ? noteItemActiveBg
                          : "transparent",
                        borderColor: isActive
                          ? noteItemActiveBorder
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor =
                            noteItemHoverBg;
                          e.currentTarget.style.borderColor =
                            noteItemHoverBorder;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      className="mb-1 w-full rounded-lg p-3 text-left transition-all duration-200 border"
                    >
                      <h3
                        style={{
                          color: isActive
                            ? noteItemActiveTitle
                            : noteItemInactiveTitle,
                        }}
                        className="font-medium"
                      >
                        {note.title}
                      </h3>
                      <p
                        style={{
                          color: isActive
                            ? noteItemActiveDate
                            : noteItemInactiveDate,
                        }}
                        className="mt-1 text-xs"
                      >
                        {new Date(note.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p style={{ color: noNotesText }}>No notes found.</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Right Sidebar — Files */}
      <aside
        style={{
          backgroundColor: sidebarBg,
          borderColor: sidebarBorder,
        }}
        className={`
          absolute right-0 top-0 h-full w-80
          border-l z-50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isFilesOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            style={{ borderColor: sidebarBorder }}
            className="flex items-center justify-between p-4 border-b"
          >
            <h2
              style={{ color: sidebarHeaderText }}
              className="text-lg font-semibold"
            >
              Files
            </h2>
            <button
              onClick={() => setIsFilesOpen(false)}
              style={{ color: sidebarCloseText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = sidebarCloseHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = sidebarCloseText)
              }
              className="transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 pt-2">
            {MOCK_FILES.map((file) => (
              <button
                key={file.id}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = noteItemHoverBg;
                  e.currentTarget.style.borderColor = noteItemHoverBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                className="mb-1 w-full rounded-lg p-3 text-left transition-all duration-200 border flex items-center gap-3"
              >
                <span className="flex-shrink-0">
                  {fileIcon(file.type, isDark)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    style={{ color: noteItemInactiveTitle }}
                    className="font-medium text-sm truncate"
                  >
                    {file.name}
                  </h3>
                  <p
                    style={{ color: noteItemInactiveDate }}
                    className="mt-0.5 text-xs"
                  >
                    {file.size} ·{" "}
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Editor */}
      <main style={{ backgroundColor: bg }} className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {currentNoteId !== "new" && singleNoteQuery.isLoading ? (
            <div className="ml-12">
              <div
                style={{ backgroundColor: skeletonBg }}
                className="h-12 w-80 animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: skeletonBg }}
                className="mt-8 h-4 w-full animate-pulse rounded"
              />
              <div
                style={{ backgroundColor: skeletonBg }}
                className="mt-3 h-4 w-3/4 animate-pulse rounded"
              />
            </div>
          ) : (
            <>
              <div
                style={{ borderColor: dividerColor }}
                className="ml-12 border-b w-[calc(100%-3rem)] mb-6 pb-6"
              >
                <div className="w-full flex items-center justify-between">
                  <input
                    type="text"
                    value={currentNoteTitle}
                    placeholder="Untitled"
                    onChange={handleInputChange}
                    style={{
                      backgroundColor: titleBg,
                      color: titleColor,
                    }}
                    className="font-bold text-5xl border-none outline-none"
                    // inline placeholder color via CSS var isn't possible with style prop,
                    // so we use a className trick below
                  />
                  <div className="flex items-center justify-center gap-3">
                    <Switch
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                      height={15}
                      width={42}
                      handleDiameter={8}
                      offColor="#e4e4e7"
                      onColor="#27272a"
                      offHandleColor="#ffffff"
                      onHandleColor="#ffffff"
                      uncheckedIcon={false}
                      checkedIcon={false}
                    />
                    <button className="group p-2 rounded-md transition-all duration-200 hover:bg-red-500/10">
                      <Trash className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {singleNoteQuery.data && singleNoteQuery.data.createdAt && (
                  <div className="flex w-1/2 items-center justify-between mt-2">
                    <p style={{ color: createdLabelColor }} className="text-sm">
                      Created
                    </p>
                    <p style={{ color: createdValueColor }} className="text-sm">
                      {format(
                        new Date(singleNoteQuery.data.createdAt),
                        "MMM d, yyyy",
                      )}
                    </p>
                  </div>
                )}
              </div>

              <BlockNoteView
                onChange={handleContentChange}
                className="p-0 mt-6 w-full h-full"
                editor={editor}
                theme={isDark ? "dark" : "light"}
              />
            </>
          )}
        </div>
      </main>

      {/* Placeholder color for title input — injected via a style tag */}
      <style>{`
        input::placeholder {
          color: ${titlePlaceholder};
        }
      `}</style>
    </div>
  );
};

export default Notes;
