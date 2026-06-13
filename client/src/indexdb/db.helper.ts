import { DBStore } from "./db.types";

const DB_NAME = "Dreaming";
const DB_VERSION = 1;
export const initIndexDb = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    console.log("request", request);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DBStore.Notes)) {
        db.createObjectStore(DBStore.Notes, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const result = request.result;
      console.log("result", result);
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
  content = "",
  timeStamp = new Date(),
}: {
  id: string;
  title: string;
  content?: string;
  timeStamp?: Date;
}) => {
  const db = await initIndexDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    const request = store.add({
      id,
      title,
      titleTimeStamp: timeStamp || new Date(),
      content,
      contentTimeStamp: timeStamp || new Date(),
      syncStatus: "pending",
    });

    request.onerror = () => reject(request.error);

    tx.oncomplete = () => resolve();

    tx.onerror = () => reject(tx.error);
  });
};

export const getNote = async (id: string) => {
  const db = await initIndexDb();

  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readonly");
    const store = tx.objectStore(DBStore.Notes);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAllNotes = async () => {
  const db = await initIndexDb();

  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readonly");
    const store = tx.objectStore(DBStore.Notes);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateNoteTitle = async (
  id: string,
  title: string,
  timeStamp = new Date(),
) => {
  const note = await getNote(id);

  if (!note) {
    throw new Error("Note not found");
  }

  note.title = title;
  note.titleTimeStamp = timeStamp || new Date();
  note.syncStatus = "pending";

  const db = await initIndexDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.put(note);

    tx.oncomplete = () => resolve();

    tx.onerror = () => reject(tx.error);
  });
};

export const updateNoteContent = async (
  id: string,
  content: string,
  timeStamp = new Date(),
) => {
  const note = await getNote(id);

  if (!note) {
    throw new Error("Note not found");
  }

  note.content = content;
  note.contentTimeStamp = timeStamp || new Date();
  note.syncStatus = "pending";

  const db = await initIndexDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.put(note);

    tx.oncomplete = () => resolve();

    tx.onerror = () => reject(tx.error);
  });
};

export const deleteNote = async (id: string) => {
  const db = await initIndexDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DBStore.Notes, "readwrite");
    const store = tx.objectStore(DBStore.Notes);

    store.delete(id);

    tx.oncomplete = () => resolve();

    tx.onerror = () => reject(tx.error);
  });
};
