import React, { useCallback, useEffect, useRef } from "react";
import { Box, SxProps, Typography } from "@mui/material";
import { ActionButton, ActionGroup, ActionInput, actionSize } from "./Action";
import { centerTextSx, colorMix } from "@/utils/ui";
import type { Prettify } from "@/utils";

/**
 * 列表元件中，每一列的高度
 */
const listRowHeight = 22;

type ListRowProps = {
  icon?: `codicon codicon-${string}`;
  text: string;
  active?: boolean;
  onClick: () => void;
};

/**
 * 列表中的列元件
 */
const ListRow = (props: ListRowProps) => {
  const { icon = "codicon codicon-blank", text, active, onClick } = props;

  return (
    <Box
      onClick={onClick}
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
      <Box sx={{ display: "flex", alignItems: "center", height: listRowHeight, gap: 0.75 }}>
        <Box sx={{ color: "text.primary" }}>
          <i className={icon} style={{ display: "block", fontSize: listRowHeight - 2 }} />
        </Box>
        <Typography variant="caption" sx={centerTextSx}>
          {text}
        </Typography>
      </Box>
    </Box>
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
      scrollContainerRef.current?.scrollBy({ top: delta, behavior: "smooth" });
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
 *
 */
const useSortItems = (params: { items: ListItem[]; orderBy: "custom" | "text"; order: "asc" | "desc" }) => {};

/**
 *
 */
const useFilterItems = (params: { items: ListItem[]; filterText: string; inverse: boolean }) => {};

// ------------------------------------------------------------------------------

/**
 * 渲染列表時，應該要傳入的每個項目型別
 */
type ListItem = Prettify<Omit<ListRowProps, "onClick"> & { id: string }>;

type ListProps = {
  items: ListItem[];
  maxRows?: number;
  defaultRows?: number;
  defaultActionExpanded?: boolean;
  activeItemId: string;
  onClickItem?: (item: ListItem) => void;
};

/**
 * ?
 */
const List = (props: ListProps) => {
  const { items, maxRows = 20, defaultRows = 10, defaultActionExpanded, activeItemId, onClickItem } = props;

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

  const scrollContainerSx: SxProps = {
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
      <Box ref={scrollContainerRef} sx={scrollContainerSx}>
        {items.map((item) => {
          const { id, icon, text } = item;
          const handleClick = () => onClickItem?.(item);
          return <ListRow key={id} icon={icon} text={text} active={id === activeItemId} onClick={handleClick} />;
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
          <ActionInput />
          <ActionButton icon="codicon codicon-arrow-both" />
        </ActionGroup>

        <ActionGroup orientation="horizontal" size="small">
          <ActionButton icon="codicon codicon-preserve-case" />
          <ActionButton icon="codicon codicon-arrow-down" />
        </ActionGroup>
      </Box>

      <Box
        ref={resizeOverlayRef}
        sx={{ position: "fixed", inset: 0, display: "none", zIndex: "tooltip", cursor: "row-resize" }}
      />
    </Box>
  );
};

export { listRowHeight, List };
