import type { NoteData } from "../modules/notes/notes.type";
import { DBStore } from "./db.types";

const DB_NAME = "Dreaming";
const DB_VERSION = 1;
export const initIndexDb = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DBStore.Notes)) {
        db.createObjectStore(DBStore.Notes, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const result = request.result;
      resolve(result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const createNote = async ({
  id,
  title,
  content = "[]",
  titleTimeStamp = new Date(),
  contentTimeStamp = new Date(),
}: {
  id: string;
  title: string;
  content?: string;
  titleTimeStamp?: Date;
  contentTimeStamp?: Date;
}) => {
  const db = await initIndexDb();
  return new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);
    store.put({
      id,
      title,
      titleTimeStamp,
      content: content || "[]",
      contentTimeStamp,
      syncStatus: "pending",
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(false);
  });
};

export const retryWrapper = async <T>(
  fn: () => Promise<T>,
  retryCount: number = 3,
) => {
  while (retryCount > 0) {
    try {
      const result = await fn();
      return result;
    } catch {
      retryCount--;
    }
  }
};

export const getNote = async (id: string): Promise<NoteData | null> => {
  const db = await initIndexDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readonly");
    const store = tx.objectStore(DBStore.Notes);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(false);
    };
  });
};

export const getAllNotes = async () => {
  const db = await initIndexDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readonly");
    const store = tx.objectStore(DBStore.Notes);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(false);
    };
  });
};

export const updateNoteTitleIndexDB = async (
  id: string,
  title: string,
  timeStamp = new Date(),
) => {
  const note = await getNote(id);

  if (!note) {
    await createNote({ id, title });
    return;
  }

  note.title = title;
  note.titleTimeStamp = timeStamp || new Date();
  const db = await initIndexDb();

  return new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.put(note);

    tx.oncomplete = () => resolve(true);

    tx.onerror = () => reject(false);
  });
};

export const updateNoteContentIndexDB = async (
  id: string,
  content: string,
  timeStamp = new Date(),
) => {
  const note = await getNote(id);

  if (!note) {
    await createNote({
      id,
      title: "",
      content,
    });
    return;
  }

  note.content = content;
  note.contentTimeStamp = timeStamp || new Date();
  // note.syncStatus = "pending";

  const db = await initIndexDb();

  return new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.put(note);

    tx.oncomplete = () => resolve(true);

    tx.onerror = () => reject(false);
  });
};

export const deleteNote = async (id: string) => {
  const db = await initIndexDb();

  return new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.delete(id);

    tx.oncomplete = () => resolve(true);

    tx.onerror = () => reject(false);
  });
};
