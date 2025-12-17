import { viewStateStore, type ViewState } from "@@/fileSystem/store/data";

/** 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序 */
const setSorting = (field: ViewState["sortField"]) => {
  const { sortField, sortOrder } = viewStateStore.getState();

  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

  viewStateStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewState["filter"]) => {
  viewStateStore.setState({ filter });
};

export { setSorting, setFilter };
