import * as vscode from "vscode";

import { handleDelete, handlePaste, handleRename } from "@/feature-explorer/handlers";
import { handleCreateFile, handleCreateDir } from "@/feature-explorer/handlers";
import { handleReadDirectory, handleReadImages } from "@/feature-explorer/handlers";

import { generateThumbnail } from "@/utils/host/image";
import { listSystemFolders, listVolumes } from "@/utils/host/system-windows";
import type { WithProgress } from "@/utils/shared/type";

// ---------------------------------------------------------------------------------

const showInfo = (message: string) => {
  vscode.window.showInformationMessage(message);
};

const showError = (message: string) => {
  vscode.window.showErrorMessage(message);
};

const showErrorReport = async (content: string) => {
  const doc = await vscode.workspace.openTextDocument({ content, language: "markdown" });
  vscode.window.showTextDocument(doc, { preview: false });
};

const showCreateInputBox = async (prompt: string, placeHolder: string) => {
  return await vscode.window.showInputBox({ prompt, placeHolder });
};

const writeClipboard = async (text: string) => {
  await vscode.env.clipboard.writeText(text);
};

const withProgress: WithProgress = async (taskName, taskFn) => {
  const progressOptions: vscode.ProgressOptions = {
    title: taskName,
    location: vscode.ProgressLocation.Notification,
    cancellable: false,
  };

  return await vscode.window.withProgress(progressOptions, async (progress) => {
    const report = (params: { increment: number; message?: string }) => progress.report(params);
    return await taskFn(report);
  });
};

const openTarget = ({ dirPath, target }: { dirPath: string; target: "workspace" | "terminal" }) => {
  if (target === "workspace") {
    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(dirPath), true);
  } else if (target === "terminal") {
    vscode.window.createTerminal({ cwd: dirPath }).show();
  }
};

const openFile = (filePath: string) => {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath), vscode.ViewColumn.Active);
};

// ---------------------------------------------------------------------------------

/** 使用者選擇要對剪貼簿中的項目執行的操作時的標題 */
const pastePickOptions: vscode.QuickPickOptions = {
  title: "對於每個項目...",
  placeHolder: "請選擇對於剪貼簿的每個項目，要執行的操作",
};

/** 使用者選擇要對剪貼簿中的項目執行的操作時的選項 */
const pasteOptions: (vscode.QuickPickItem & { type?: "copy" | "move"; overwrite?: boolean })[] = [
  {
    label: "複製",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("copy"),
    label: "複製",
    description: "不覆蓋",
    detail:
      "對於單一項目，若為檔案且目標有相同名稱，則跳過；若為資料夾且目標有相同名稱，則將來源內容合併至目標，不覆蓋目標中已存在的檔案。",
    type: "copy",
    overwrite: false,
  },
  {
    iconPath: new vscode.ThemeIcon("copy"),
    label: "複製",
    description: "$(warning) 覆蓋",
    detail: "如果目標位置已有相同項目，會直接以來源項目取代，原有內容將被覆蓋。",
    type: "copy",
    overwrite: true,
  },
  {
    label: "移動",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("go-to-file"),
    label: "移動",
    description: "不覆蓋",
    detail: "對於單一項目，只要目標位置已存在相同項目或該項目的部分內容，就會跳過執行該項目的移動操作。",
    type: "move",
    overwrite: false,
  },
  {
    iconPath: new vscode.ThemeIcon("go-to-file"),
    label: "移動",
    description: "$(warning) 覆蓋",
    detail: "如果目標位置已有相同項目，會直接以來源項目取代，原有內容將被覆蓋。",
    type: "move",
    overwrite: true,
  },
];

// ---------------------------------------------------------------------------------

const explorerAPI = {
  "show.info": showInfo,
  "show.error": showError,
  "clipboard.write": writeClipboard,

  "system.read.dir": handleReadDirectory,
  "system.read.system.folders": () => {
    if (process.platform !== "win32") return Promise.resolve([]);
    return listSystemFolders();
  },
  "system.read.volumes": () => {
    if (process.platform !== "win32") return Promise.resolve([]);
    return listVolumes();
  },
  "system.read.images": ({ dirPath }: { dirPath: string }) => {
    return handleReadImages(dirPath, withProgress);
  },

  "system.generate.thumbnail": (params: { filePath: string }) => {
    return generateThumbnail(params.filePath);
  },

  "system.open.file": openFile,
  "system.open.dir": openTarget,

  "system.create.file": async ({ dirPath }: { dirPath: string }) => {
    const fileName = await showCreateInputBox("輸入新檔案名稱", "檔案名稱");
    if (!fileName) return null;
    return handleCreateFile({ dirPath, fileName, showError, openFile });
  },
  "system.create.dir": async ({ dirPath }: { dirPath: string }) => {
    const folderName = await showCreateInputBox("輸入新資料夾名稱", "資料夾名稱");
    if (!folderName) return null;
    return handleCreateDir({ dirPath, folderName, showError });
  },
  "system.create.paste": async ({ srcList, destDir }: { srcList: string[]; destDir: string }) => {
    const pick = await vscode.window.showQuickPick(pasteOptions, pastePickOptions);
    if (!pick || !pick.type || pick.overwrite === undefined) return null;

    const { type, overwrite } = pick;
    return handlePaste({ srcList, destDir, type, overwrite, withProgress, showErrorReport });
  },
  "system.delete": async (params: { itemList: string[]; dirPath: string }) => {
    const confirmationMessage = `確定要刪除所選的 ${params.itemList.length} 個項目嗎？此操作無法復原！`;

    const confirm = await vscode.window.showWarningMessage(confirmationMessage, { modal: true }, "確定");
    if (confirm !== "確定") return handleReadDirectory({ dirPath: params.dirPath });

    return handleDelete({ ...params, showErrorReport, withProgress });
  },
  "system.update.rename": (params: { name: string; newName: string; dirPath: string }) => {
    return handleRename({ ...params, showError });
  },
};

type ExplorerAPI = typeof explorerAPI;

export { explorerAPI };
export type { ExplorerAPI };
