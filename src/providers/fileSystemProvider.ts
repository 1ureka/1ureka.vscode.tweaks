import * as vscode from "vscode";

import { onDidReceiveInvoke } from "@/utils/message_host";
import { createWebviewPanelManager } from "@/utils/webview";
import { handleDelete, handleInitialData, handlePaste, handleRename } from "@/handlers/fileSystemHandlers";
import { handleCreateFile, handleCreateDir, handleReadDirectory, handleGoto } from "@/handlers/fileSystemHandlers";
import type { WithProgress } from "@/utils";

import fileSystemLight from "@/assets/file-system-light.svg";
import fileSystemDark from "@/assets/file-system-dark.svg";

// ---------------------------------------------------------------------------------
// 定義初始注入資料型別與延伸主機端所有可呼叫的處理器 API 型別
// ---------------------------------------------------------------------------------

type OpenInTarget = "workspace" | "terminal" | "imageWall";
type FileSystemInitialData = Awaited<ReturnType<typeof handleReadDirectory>>;

type ShowInfoAPI = {
  id: "showInformationMessage";
  handler: (params: { message: string }) => void;
};
type SetSystemClipboardAPI = {
  id: "setSystemClipboard";
  handler: (params: { text: string }) => Promise<void>;
};
type ReadDirAPI = {
  id: "readDirectory";
  handler: typeof handleReadDirectory;
};
type CreateFileAPI = {
  id: "createFile";
  handler: (params: { dirPath: string }) => ReturnType<typeof handleCreateFile>;
};
type CreateDirAPI = {
  id: "createDir";
  handler: (params: { dirPath: string }) => ReturnType<typeof handleCreateDir>;
};
type OpenFileAPI = {
  id: "openFile";
  handler: (params: { filePath: string }) => void;
};
type OpenInTargetAPI = {
  id: "openInTarget";
  handler: (params: { dirPath: string; target: OpenInTarget }) => void;
};
type GotoPathAPI = {
  id: "gotoPath";
  handler: (params: { dirPath: string }) => ReturnType<typeof handleGoto>;
};
type PasteAPI = {
  id: "paste";
  handler: (params: { srcList: string[]; destDir: string }) => ReturnType<typeof handlePaste>;
};
type RenameAPI = {
  id: "rename";
  handler: (params: { name: string; newName: string; dirPath: string }) => ReturnType<typeof handleRename>;
};
type DeleteAPI = {
  id: "delete";
  handler: (params: { itemList: string[]; dirPath: string }) => ReturnType<typeof handleDelete>;
};

export type { FileSystemInitialData };
export type { ShowInfoAPI, SetSystemClipboardAPI, ReadDirAPI, CreateFileAPI, CreateDirAPI, PasteAPI };
export type { OpenFileAPI, OpenInTargetAPI, GotoPathAPI, RenameAPI, DeleteAPI };

// ---------------------------------------------------------------------------------

/**
 * 提供系統瀏覽器面板的管理功能，包括創建和獲取當前面板、面板的各種API註冊、與提供給處理器所需的流程依賴
 */
function FileSystemPanelProvider(context: vscode.ExtensionContext) {
  const panelManager = createWebviewPanelManager(context);

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

  const showGotoInputBox = async (dirPath: string) => {
    return await vscode.window.showInputBox({ title: "前往...", prompt: "輸入路徑", value: dirPath });
  };

  const showCreateInputBox = async (prompt: string, placeHolder: string) => {
    return await vscode.window.showInputBox({ prompt, placeHolder });
  };

  const openTarget = (dirPath: string, target: OpenInTarget) => {
    if (target === "workspace") {
      vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(dirPath), true);
    } else if (target === "terminal") {
      vscode.window.createTerminal({ cwd: dirPath }).show();
    } else if (target === "imageWall") {
      vscode.commands.executeCommand("1ureka.imageWall.openFromPath", dirPath);
    }
  };

  const openFile = (filePath: string) => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath), vscode.ViewColumn.Active);
  };

  const withProgress: WithProgress = async (taskName, taskFn) => {
    const progressOptions: vscode.ProgressOptions = {
      title: taskName,
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
    };

    return await vscode.window.withProgress(progressOptions, async (progress) => {
      const report = (increment: number) => progress.report({ increment });
      return await taskFn(report);
    });
  };

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

  const createPanel = (dirPath: string) => {
    const initialData = handleInitialData({ dirPath });
    const panel = panelManager.create<FileSystemInitialData>({
      panelId: "1ureka.fileSystem",
      panelTitle: "系統瀏覽器",
      webviewType: "fileSystem",
      extensionUri: context.extensionUri,
      resourceUri: vscode.Uri.file(dirPath),
      initialData,
      iconPath: { light: vscode.Uri.parse(fileSystemLight), dark: vscode.Uri.parse(fileSystemDark) },
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInformationMessage", ({ message }) => {
      showInfo(message);
    });
    onDidReceiveInvoke<SetSystemClipboardAPI>(panel, "setSystemClipboard", async ({ text }) => {
      await vscode.env.clipboard.writeText(text);
    });
    onDidReceiveInvoke<ReadDirAPI>(panel, "readDirectory", (params) => {
      return handleReadDirectory({ ...params });
    });
    onDidReceiveInvoke<CreateFileAPI>(panel, "createFile", async ({ dirPath }) => {
      const fileName = await showCreateInputBox("輸入新檔案名稱", "檔案名稱");
      if (!fileName) return null;
      return handleCreateFile({ dirPath, fileName, showError, openFile });
    });
    onDidReceiveInvoke<CreateDirAPI>(panel, "createDir", async ({ dirPath }) => {
      const folderName = await showCreateInputBox("輸入新資料夾名稱", "資料夾名稱");
      if (!folderName) return null;
      return handleCreateDir({ dirPath, folderName, showError });
    });
    onDidReceiveInvoke<OpenFileAPI>(panel, "openFile", ({ filePath }) => {
      openFile(filePath);
    });
    onDidReceiveInvoke<OpenInTargetAPI>(panel, "openInTarget", ({ dirPath, target }) => {
      openTarget(dirPath, target);
    });
    onDidReceiveInvoke<GotoPathAPI>(panel, "gotoPath", ({ dirPath }) => {
      return handleGoto({ getInputPath: () => showGotoInputBox(dirPath), onError: showError });
    });
    onDidReceiveInvoke<PasteAPI>(panel, "paste", async ({ srcList, destDir }) => {
      const pick = await vscode.window.showQuickPick(pasteOptions, pastePickOptions);
      if (!pick || !pick.type || pick.overwrite === undefined) return null;

      const { type, overwrite } = pick;

      return handlePaste({ srcList, destDir, type, overwrite, withProgress, showErrorReport });
    });
    onDidReceiveInvoke<RenameAPI>(panel, "rename", async (params) => {
      return handleRename({ ...params, showError });
    });
    onDidReceiveInvoke<DeleteAPI>(panel, "delete", async (params) => {
      const confirm = await vscode.window.showWarningMessage(
        `確定要刪除所選的 ${params.itemList.length} 個項目嗎？此操作無法復原！`,
        { modal: true },
        "是",
        "否"
      );

      if (confirm !== "是") return handleReadDirectory({ dirPath: params.dirPath });

      return handleDelete({ ...params, showErrorReport, withProgress });
    });
  };

  return { getCurrentPanel: panelManager.getCurrent, createPanel };
}

export { FileSystemPanelProvider };
