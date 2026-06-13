import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

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

const Notes = () => {
  const queryClient = useQueryClient();

  const { topicId } = useParams<{ topicId: string }>();

  const [isNotesOpen, setIsNotesOpen] = useState(false);

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
          {
            withCredentials: true,
          },
        );

        console.log(response.data);

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
          contentTimeStamp: new Date(data.titleTimeStamp), // content just created, same time is fine
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
          // First time loading this note — write everything from server to IndexDB
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

        // Title sync
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

        // Content sync
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
        console.log(
          "Updating note title with ID:",
          currentNoteId,
          "to:",
          newTitle,
        );
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

  return (
    <div className="relative h-screen bg-[#1F1F1F] overflow-hidden">
      {/* Backdrop */}
      {isNotesOpen && (
        <div
          onClick={() => setIsNotesOpen(false)}
          className="
            absolute
            inset-0
            bg-black/30
            backdrop-blur-[2px]
            z-40
            transition-all
          "
        />
      )}

      {/* Open Button */}
      {!isNotesOpen && (
        <button
          onClick={() => setIsNotesOpen(true)}
          className="
            absolute
            top-4
            left-4
            z-50
            h-10
            w-10
            rounded-lg
            bg-[#2A2A2A]
            text-white
            shadow-lg
            hover:bg-[#353535]
            transition-all
          "
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          absolute
          left-0
          top-0
          h-full
          w-80
          bg-[#252525]
          border-r
          border-zinc-800
          z-50
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out
          ${isNotesOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Notes</h2>

            <button
              onClick={() => {
                setIsNotesOpen(false);
              }}
              className="
                text-zinc-400
                hover:text-white
                transition-colors
              "
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
                editor.replaceBlocks(editor.document, JSON.parse("[]"));
              }}
              className="
                w-full
                rounded-lg
                bg-zinc-800
                py-2.5
                text-white
                hover:bg-zinc-700
                transition
              "
            >
              + New Note
            </button>
          </div>

          {/* Notes List */}
          {notesQuery.isLoading ? (
            <div className="flex-1  justify-center flex">
              <Spinner />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {notesList && notesList.length > 0 ? (
                notesList.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setCurrentNoteId(note.id);
                      handleSaveToLocalStorage(note.id, topicId!);
                      setIsNotesOpen(false);
                    }}
                    className={`
    mb-1
    w-full
    rounded-lg
    p-3
    text-left
    transition-all
    duration-200
    border

    ${
      currentNoteId === note.id
        ? `
          bg-zinc-800
          border-zinc-600
          shadow-sm
        `
        : `
          bg-transparent
          border-transparent
          hover:bg-zinc-900
          hover:border-zinc-800
        `
    }
  `}
                  >
                    <h3
                      className={`font-medium ${
                        currentNoteId === note.id
                          ? "text-white"
                          : "text-zinc-300"
                      }`}
                    >
                      {note.title}
                    </h3>

                    <p
                      className={`mt-1 text-xs ${
                        currentNoteId === note.id
                          ? "text-zinc-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-zinc-400">No notes found.</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Editor */}
      <main className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {currentNoteId !== "new" && singleNoteQuery.isLoading ? (
            <div className="ml-12">
              <div className="h-12  w-80 animate-pulse rounded bg-zinc-800" />
              <div className="mt-8 h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
            </div>
          ) : (
            <>
              <div className="ml-12 border-b border-zinc-800 w-[calc(100%-3rem)] mb-6 pb-6">
                <input
                  type="text"
                  value={currentNoteTitle}
                  placeholder="Untitled"
                  onChange={handleInputChange}
                  className="bg-[#1F1F1F] text-white placeholder:text-[#373737] font-bold text-5xl border-none outline-none "
                />

                {singleNoteQuery.data && singleNoteQuery.data.createdAt && (
                  <div className="flex w-1/2 items-center justify-between mt-2">
                    <p className="text-sm text-[#A4A09B]">Created</p>
                    <p className="text-sm text-white">
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
                className="p-0 mt-6"
                editor={editor}
                theme="dark"
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notes;
