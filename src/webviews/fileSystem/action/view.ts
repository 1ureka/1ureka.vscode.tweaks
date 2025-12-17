import { fileSystemViewStore, type ViewStateStore } from "@@/fileSystem/store/view";

/** 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序 */
const setSorting = (field: ViewStateStore["sortField"]) => {
  const { sortField, sortOrder } = fileSystemViewStore.getState();

  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

  fileSystemViewStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewStateStore["filter"]) => {
  fileSystemViewStore.setState({ filter });
};

export { setSorting, setFilter };
