import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

export const NoteEditor = ({
  noteId,
  theme,
  onContentChange,
  editor,
}: {
  noteId: string;
  editor: ReturnType<typeof useCreateBlockNote>["editor"];
  theme: "light" | "dark";
  onContentChange: (content: string) => void;
}) => {
  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      onChange={() => onContentChange(JSON.stringify(editor.document))}
    />
  );
};
