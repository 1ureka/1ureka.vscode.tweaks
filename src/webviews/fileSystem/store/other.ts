import { create } from "zustand";
import type { InspectDirectoryEntry } from "@/utils/system";

type FileSystemBoxSelection = {
  isBoxSelecting: boolean;
};

const fileSystemBoxSelectionStore = create<FileSystemBoxSelection>(() => ({
  isBoxSelecting: false,
}));

type FileSystemClipboard = {
  entries: { [filePath: string]: InspectDirectoryEntry };
};

const fileSystemClipboardStore = create<FileSystemClipboard>(() => ({
  entries: {},
}));

export type { FileSystemClipboard };
export { fileSystemBoxSelectionStore, fileSystemClipboardStore };
