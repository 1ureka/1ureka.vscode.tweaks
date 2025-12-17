import Fuse from "fuse.js";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, SxProps, Typography } from "@mui/material";
import { ActionButton, ActionGroup, ActionInput, actionSize } from "@@/fileSystem/components/Action";
import { centerTextSx, colorMix } from "@/utils/ui";
import { Tooltip } from "@@/fileSystem/components/Tooltip";

/**
 * 列表元件中，每一列的高度
 */
const listRowHeight = 22;

/**
 * 渲染列表時，應該要傳入的每個項目型別
 */
type ListItem = {
  id: string;
  /** 預設為空白圖示 (codicon-blank) */
  icon?: `codicon codicon-${string}`;
  /** 顯示在 row 中的文字 */
  text: string;
  /** 可選的補充資訊，將會在 tooltip 中顯示 */
  detail?: string;
  /** 是否為目前選取的項目 */
  active?: boolean;
};

/**
 * 列表中的列元件
 */
const ListRow = (props: ListItem) => {
  const { icon = "codicon codicon-blank", text, detail, active } = props;

  return (
    <Tooltip actionName={detail ? detail : text} placement="right">
      <Box
        className="list-row"
        sx={{
          borderRadius: 1,
          px: 0.25,
          cursor: "default",
          bgcolor: active ? "action.active" : undefined,
          "&:hover": { bgcolor: active ? "action.active" : colorMix("background.content", "text.primary", 0.9) },
          // 因為有些瀏覽器明明在 overflow 對齊時，仍會渲染上面或下面那個應該完全看不見的 item 的一小塊，因此加個內框遮住
          boxShadow: "inset 0 0 0 1px var(--mui-palette-background-content)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", height: listRowHeight, overflow: "hidden", gap: 0.75 }}>
          <Box sx={{ color: "text.primary" }}>
            <i className={icon} style={{ display: "block", fontSize: listRowHeight - 2 }} />
          </Box>
          <Typography variant="caption" sx={centerTextSx}>
            {text}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};

// ------------------------------------------------------------------------------

/**
 * 用於讓列表可以拖動調整高度，必須給定 onResize 回調用於更新高度
 * 返回給把手註冊的按下處理函數與當前列數的引用
 */
const useListResize = (params: {
  onResize: (height: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  defaultRows: number;
  maxRows: number;
}) => {
  const { onResize, onStart, onEnd, defaultRows, maxRows } = params;
  const rowsRef = useRef(Math.min(defaultRows, maxRows));

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    onStart?.();
    const startY = e.clientY;
    const startRows = rowsRef.current;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const rowDelta = Math.round(deltaY / listRowHeight);

      const newRows = startRows + rowDelta;
      if (newRows < 1) {
        rowsRef.current = startRows;
      } else {
        rowsRef.current = Math.min(newRows, maxRows);
      }

      onResize(rowsRef.current * listRowHeight);
    };

    const handleMouseUp = () => {
      onEnd?.();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return { handleMouseDown, rowsRef };
};

/**
 * 用於讓列表的滾輪滾動時可以避免滑過頭，必須給定滾動容器的引用以及可選的用於實時判斷是否可滾動的函數
 */
const useListWheelScroll = (params: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  getScrollable?: () => boolean;
}) => {
  const { scrollContainerRef, getScrollable } = params;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (getScrollable && !getScrollable()) return;
      e.preventDefault();
      const deltaRows = e.deltaY > 0 ? 1 : -1;
      const delta = listRowHeight * deltaRows;
      scrollContainerRef.current?.scrollBy({ top: delta, behavior: "auto" });
    };

    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      scrollContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [scrollContainerRef, getScrollable]);
};

/**
 * 用於讓列表的操作列可以展開與收合，必須給定初始展開狀態、展開按鈕的引用與操作列容器的引用
 */
const useExpandActions = (params: {
  defaultExpanded: boolean;
  expandActionIconRef: React.RefObject<HTMLDivElement | null>;
  actionContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { defaultExpanded, expandActionIconRef, actionContainerRef } = params;
  const expandedRef = useRef(defaultExpanded);

  const toggleExpanded = () => {
    expandedRef.current = !expandedRef.current;

    if (expandActionIconRef.current) {
      expandActionIconRef.current.style.transform = expandedRef.current ? "rotate(90deg)" : "rotate(0deg)";
    }
    if (actionContainerRef.current) {
      actionContainerRef.current.style.height = expandedRef.current ? `${actionSize.small + 4}px` : "0px";
    }
  };

  return { toggleExpanded };
};

/**
 * 用於對列表項目進行過濾，返回過濾後的項目與目前的過濾狀態及切換函數
 */
const useFilterItems = (items: ListItem[]) => {
  const [filterText, setFilterText] = useState("");
  const [invertMatch, setInvertMatch] = useState(false);

  const filteredItems = useMemo(() => {
    if (filterText.trim() === "") return items;

    const fuse = new Fuse(items, {
      keys: ["text"],
      threshold: 0.4,
      shouldSort: false,
      includeMatches: false,
      includeScore: false,
    });

    const results = fuse.search(filterText);
    const matchedItems = results.map((result) => result.item);

    if (invertMatch) {
      const matchedIds = new Set(matchedItems.map((item) => item.id));
      return items.filter((item) => !matchedIds.has(item.id));
    } else {
      return matchedItems;
    }
  }, [items, filterText, invertMatch]);

  const toggleInvertMatch = () => {
    setInvertMatch((prev) => !prev);
  };

  const handleFilterTextChange = (text: string) => {
    setFilterText(text);
  };

  return { filteredItems, filterText, invertMatch, handleFilterTextChange, toggleInvertMatch };
};

/**
 * 用於對列表項目進行排序，返回排序後的項目與目前的排序狀態及切換函數
 */
const useSortItems = (items: ListItem[]) => {
  const [orderBy, setOrderBy] = useState<"custom" | "text">("custom");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const sortedItems = useMemo(() => {
    let sorted = [...items];

    if (orderBy === "custom" && order === "asc") {
      return sorted;
    }
    if (orderBy === "custom" && order === "desc") {
      return sorted.reverse();
    }
    if (orderBy === "text" && order === "asc") {
      sorted.sort((a, b) => a.text.localeCompare(b.text));
    }
    if (orderBy === "text" && order === "desc") {
      sorted.sort((a, b) => b.text.localeCompare(a.text));
    }

    return sorted;
  }, [items, orderBy, order]);

  const toggleOrderBy = () => {
    setOrderBy((prev) => (prev === "custom" ? "text" : "custom"));
  };

  const toggleOrder = () => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return { sortedItems, orderBy, order, toggleOrderBy, toggleOrder };
};

/**
 * 用於避免為每個列表項目都註冊點擊事件，透過事件代理的方式來處理點擊事件，注意 items 必須與實際要渲染的項目一致 (排序與過濾後的項目)
 */
const useHandleClick = (params: { onClickItem: (item: ListItem) => void; items: ListItem[] }) => {
  const { onClickItem, items } = params;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const listElement = e.currentTarget;
      const listItemElement = target.closest(".list-row");

      if (listItemElement && listElement.contains(listItemElement)) {
        const siblings = Array.from(listElement.children);
        const index = siblings.indexOf(listItemElement);

        if (index >= 0 && index < items.length) {
          const item = items[index];
          onClickItem(item);
        }
      }
    },
    [onClickItem, items]
  );

  return handleClick;
};

// ------------------------------------------------------------------------------

type ListProps = {
  items: ListItem[];
  maxRows?: number;
  defaultRows?: number;
  defaultActionExpanded?: boolean;
  activeItemId: string;
  onClickItem?: (item: ListItem) => void;
};

/**
 * 列表元件，遵循 DSL 原則設計，因此只要帶入正確結構的資料即可包括所有通用的列表邏輯與 UI
 */
const List = (props: ListProps) => {
  const { items, maxRows = 20, defaultRows = items.length, defaultActionExpanded, activeItemId, onClickItem } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resizeOverlayRef = useRef<HTMLDivElement>(null);
  const expandActionIconRef = useRef<HTMLDivElement>(null);
  const actionContainerRef = useRef<HTMLDivElement>(null);

  const { handleMouseDown, rowsRef } = useListResize({
    onResize: (height) => {
      if (scrollContainerRef.current) scrollContainerRef.current.style.height = `${height}px`;
    },
    onStart: () => {
      if (resizeOverlayRef.current) resizeOverlayRef.current.style.display = "block";
    },
    onEnd: () => {
      if (resizeOverlayRef.current) resizeOverlayRef.current.style.display = "none";
    },
    defaultRows,
    maxRows,
  });

  const getScrollable = useCallback(() => {
    return items.length > rowsRef.current;
  }, [items.length, rowsRef]);

  useListWheelScroll({
    scrollContainerRef,
    getScrollable,
  });

  const { toggleExpanded } = useExpandActions({
    defaultExpanded: defaultActionExpanded ?? false,
    expandActionIconRef,
    actionContainerRef,
  });

  // 先過濾再排序，因為無論時間複雜度，只有過濾有可能減少 n 的數量
  const { filteredItems, filterText, invertMatch, handleFilterTextChange, toggleInvertMatch } = useFilterItems(items);
  const { sortedItems, orderBy, order, toggleOrderBy, toggleOrder } = useSortItems(filteredItems);

  const handleClick = useHandleClick({ onClickItem: onClickItem ?? (() => {}), items: sortedItems });

  const scrollContainerSx: SxProps = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: rowsRef.current * listRowHeight,
    transition: "height 0.1s",
    overflowY: "auto",
    scrollSnapType: "y mandatory",
    "& > div": { scrollSnapAlign: "start" },
    pr: 1,
  };

  const actionContainerSx: SxProps = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "end",
    gap: 0.5,
    height: defaultActionExpanded ? actionSize.small + 4 : 0,
    transition: "height 0.1s",
    overflow: "hidden",
  };

  // TODO: 自動虛擬化
  return (
    <Box sx={{ p: 0.75, bgcolor: "background.content", borderRadius: 1 }}>
      <Box ref={scrollContainerRef} sx={scrollContainerSx} onClick={handleClick}>
        {sortedItems.map((item) => {
          return <ListRow key={item.id} {...item} active={item.id === activeItemId} />;
        })}
      </Box>

      <Box sx={{ display: "grid", alignItems: "stretch", gridTemplateColumns: "auto 1fr", gap: 0.5 }}>
        <Box
          onClick={toggleExpanded}
          sx={{ cursor: "pointer", display: "grid", placeItems: "center", opacity: 0.5, "&:hover": { opacity: 1 } }}
        >
          <i
            ref={expandActionIconRef}
            className="codicon codicon-triangle-right"
            style={{ display: "block", transform: defaultActionExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </Box>

        <Box
          onMouseDown={handleMouseDown}
          sx={{ cursor: "row-resize", mt: 0.25, opacity: 0.5, "&:hover": { opacity: 1 } }}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <i className="codicon codicon-gripper" style={{ display: "block", transform: "rotate(90deg)" }} />
          </Box>
        </Box>
      </Box>

      <Box ref={actionContainerRef} sx={actionContainerSx}>
        <ActionGroup orientation="horizontal" size="small">
          <ActionInput
            actionName="依名稱過濾"
            actionDetail="僅顯示符合此名稱的項目"
            value={filterText}
            onChange={handleFilterTextChange}
          />
          <ActionButton
            actionIcon="codicon codicon-arrow-both"
            actionName="反轉"
            actionDetail="反轉篩選後的結果"
            onClick={toggleInvertMatch}
            active={invertMatch}
          />
        </ActionGroup>

        <ActionGroup orientation="horizontal" size="small">
          <ActionButton
            actionIcon="codicon codicon-preserve-case"
            actionName="依名稱排序"
            actionDetail="依其名稱順序排序"
            active={orderBy === "text"}
            onClick={toggleOrderBy}
          />
          <ActionButton
            actionIcon={order === "asc" ? "codicon codicon-arrow-down" : "codicon codicon-arrow-up"}
            actionName="反向"
            actionDetail="反向目前的排序結果"
            active={order === "desc"}
            onClick={toggleOrder}
          />
        </ActionGroup>
      </Box>

      <Box
        ref={resizeOverlayRef}
        sx={{ position: "fixed", inset: 0, display: "none", zIndex: "tooltip", cursor: "row-resize" }}
      />
    </Box>
  );
};

/**
 * 列表元件，遵循 DSL 原則設計，因此只要帶入正確結構的資料即可包括所有通用的列表邏輯與 UI
 */
const MemoedList = memo(List);

export { listRowHeight, MemoedList as List, type ListItem };
