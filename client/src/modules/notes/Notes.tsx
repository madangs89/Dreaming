import React, { useRef, useState } from "react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNotes } from "./notes.api";
import { useParams } from "react-router-dom";

const Notes = () => {
  const editor = useCreateBlockNote();

  const { topicId } = useParams<{ topicId: string }>();

  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const debounceTimerRef = useRef<number | null>(null);

  const [currentNoteId, setCurrentNoteId] = useState<string>("new");

  const [currentNoteTitle, setCurrentNoteTitle] = useState<string>("");

  
  const notesQuery = useQuery({
    queryKey: ["notes", topicId],
    queryFn: () => fetchAllNotes({ id: topicId! }),
    enabled: !!topicId,
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const notesList = notesQuery.data || [];
  const handleDebouncedTitleChange = (
    newTitle: string,
    delay: number = 1000,
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      console.log("Saving title:", newTitle);
    }, delay);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNoteTitle(e.target.value);
    handleDebouncedTitleChange(e.target.value);
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
              onClick={() => setIsNotesOpen(false)}
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
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {notesList.map((note) => (
              <button
                key={note.id}
                className="
                  mb-1
                  w-full
                  rounded-lg
                  p-3
                  text-left
                  hover:bg-zinc-800
                  transition
                "
              >
                <h3 className="font-medium text-white">{note.title}</h3>

                <p className="mt-1 text-xs text-zinc-400">{note.updatedAt}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Editor */}
      <main className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="ml-12 border-b border-zinc-800 w-[calc(100%-3rem)] mb-6 pb-6">
            <input
              type="text"
              value={currentNoteTitle}
              placeholder="Untitled"
              onChange={handleInputChange}
              className="bg-[#1F1F1F] text-white placeholder:text-[#373737] font-bold text-5xl border-none outline-none "
            />
          </div>
          <BlockNoteView className="p-0 mt-6" editor={editor} theme="dark" />
        </div>
      </main>
    </div>
  );
};

export default Notes;
