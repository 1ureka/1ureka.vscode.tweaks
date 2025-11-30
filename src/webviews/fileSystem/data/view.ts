import { create } from "zustand";
import { fileSystemDataStore } from "./data";
import type { InspectDirectoryEntry } from "../../../utils/system";
import type { Prettify } from "../../../utils/type";

const FILES_PER_PAGE = 50;

type FileProperties = Prettify<InspectDirectoryEntry & { icon: `codicon codicon-${string}` }>;

type TableViewStore = {
  page: number;
  pages: number;
  sortField: keyof Pick<FileProperties, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  filter: "all" | "file" | "folder";
  selection: { isDefaultSelected: boolean; overrides: { [filePath: string]: boolean } };
};

const initialViewState: TableViewStore = {
  page: 1,
  pages: 1,
  sortField: "fileName",
  sortOrder: "asc",
  filter: "all",
  selection: { isDefaultSelected: false, overrides: {} },
};

const fileSystemViewStore = create<TableViewStore>(() => initialViewState);

export { fileSystemViewStore as useView };

// ----------------------------------------------------------------------------

const assignIconToEntries = (entries: InspectDirectoryEntry[]): FileProperties[] => {
  return entries.map((entry) => ({ ...entry, icon: `codicon codicon-${entry.fileType}` }));
};

const useFilterEntries = (entries: FileProperties[]) => {
  const filter = fileSystemViewStore((state) => state.filter);

  let filteredEntries: FileProperties[] = [];
  if (filter === "all") {
    filteredEntries = [...entries];
  } else {
    filteredEntries = entries.filter(({ fileType }) => fileType === filter);
  }

  return filteredEntries;
};

const useSortEntries = (entries: FileProperties[]) => {
  const sortField = fileSystemViewStore((state) => state.sortField);
  const sortOrder = fileSystemViewStore((state) => state.sortOrder);

  const sortedEntries = [...entries];
  sortedEntries.sort((a, b) => {
    // 排序：資料夾優先，否則依照 sortField 與 sortOrder 排序
    if (a.fileType === "folder" && b.fileType !== "folder") return -1;
    if (a.fileType !== "folder" && b.fileType === "folder") return 1;

    const valA = a[sortField];
    const valB = b[sortField];

    let compareResult: number;
    if (typeof valA === "string" && typeof valB === "string") {
      compareResult = valA.localeCompare(valB);
    } else {
      compareResult = Number(valA) - Number(valB);
    }

    return sortOrder === "asc" ? compareResult : -compareResult;
  });

  return sortedEntries;
};

const usePaginateEntries = (entries: FileProperties[]) => {
  const page = fileSystemViewStore((state) => state.page);

  const totalPages = Math.ceil(entries.length / FILES_PER_PAGE);
  const validPage = page > totalPages ? Math.max(1, totalPages) : page;

  const startIndex = (validPage - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  fileSystemViewStore.setState({ page: validPage, pages: totalPages });
  return paginatedEntries;
};

const useViewEntries = () => {
  const entries = fileSystemDataStore((state) => state.entries);

  const entriesFiltered = useFilterEntries(assignIconToEntries(entries));
  const entriesSorted = useSortEntries(entriesFiltered);
  const entriesPaginated = usePaginateEntries(entriesSorted);

  return entriesPaginated;
};

export { useViewEntries };

// ----------------------------------------------------------------------------

const changeView = (view: Partial<TableViewStore>) => {
  fileSystemViewStore.setState(view);
};

export { changeView };
