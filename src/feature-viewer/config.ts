import * as vscode from "vscode";
import type { ExportFormat } from "@/utils/host/image";

/** 產生 withProgress 選項 */
const generateProgressOptions = (title: string) => {
  return { title, location: vscode.ProgressLocation.Notification, cancellable: false };
};

/** 格式選項介面 */
type FormatOption = vscode.QuickPickItem & { format: ExportFormat; extension: string };

/** 導出圖片時可供選擇的格式選項 */
const formatOptions: FormatOption[] = [
  {
    label: "PNG",
    description: "無損壓縮，支援透明度",
    detail: "適合需要透明背景的圖片",
    format: "png",
    extension: ".png",
  },
  {
    label: "JPEG",
    description: "有損壓縮，檔案較小",
    detail: "適合相片或不需要透明度的圖片",
    format: "jpeg",
    extension: ".jpg",
  },
  {
    label: "WebP",
    description: "現代格式，壓縮率高",
    detail: "有損壓縮，品質優於 JPEG ，且支援透明度",
    format: "webp",
    extension: ".webp",
  },
  {
    label: "WebP (無損)",
    description: "無損壓縮，支援透明度",
    detail: "若應用程式支援，相比 PNG 其檔案通常更小但品質相同",
    format: "webp-lossless",
    extension: ".webp",
  },
];

export { formatOptions, generateProgressOptions };
