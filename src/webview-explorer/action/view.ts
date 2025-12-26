import { viewStateStore, type ViewState } from "@explorer/store/data";

/** 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序 */
const setSorting = (field: ViewState["sortField"]) => {
  const { sortField, sortOrder } = viewStateStore.getState();

  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

  viewStateStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定排序欄位，順序不變 */
const setSortField = (field: ViewState["sortField"]) => {
  viewStateStore.setState({ sortField: field });
};

/** 設定排序順序，欄位不變 */
const setSortOrder = (order: ViewState["sortOrder"]) => {
  viewStateStore.setState({ sortOrder: order });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewState["filter"]) => {
  viewStateStore.setState({ filter });
};

/** 設定網格檢視的尺寸 */
const setGridSize = (size: "S" | "M" | "L") => {
  let columns: number;
  if (size === "S") {
    columns = 5;
  } else if (size === "M") {
    columns = 3;
  } else {
    columns = 2;
  }
  viewStateStore.setState({ gridColumns: columns });
};

/** 根據 column 數量取得網格尺寸 */
const getGridSize = (columns: number): "S" | "M" | "L" => {
  if (columns > 3) {
    return "S";
  } else if (columns === 3) {
    return "M";
  } else {
    return "L";
  }
};

/** 設定是否顯示網格間隙 */
const setGridGap = (gap: boolean) => {
  viewStateStore.setState({ gridGap: gap });
};

export { setSorting, setSortField, setSortOrder, setFilter, setGridSize, getGridSize, setGridGap };
