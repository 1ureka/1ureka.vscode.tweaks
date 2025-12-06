import * as vscode from "vscode";
import type { CreateFileAPI, CreateDirAPI, ReadDirAPI } from "@/providers/fileSystemProvider";
import type { OpenInWorkspaceAPI, OpenInTerminalAPI, OpenInImageWallAPI } from "@/webviews/fileSystem/data/message";
import type { FilterAllAPI, FilterFoldersAPI, FilterFilesAPI } from "@/webviews/fileSystem/data/message";
import type { CopyNameAPI, CopyPathAPI } from "@/webviews/fileSystem/data/message";
import { FileSystemPanelProvider } from "@/providers/fileSystemProvider";
import { forwardCommandToWebview } from "@/utils/message_host";
import { createCommandManager } from "@/utils/command";

/**
 * 註冊系統瀏覽器相關命令與面板
 */
export function registerFileSystemCommands(context: vscode.ExtensionContext) {
  const fileSystemProvider = FileSystemPanelProvider(context);
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.fileSystem.openFromPath", async (params: vscode.Uri | string | undefined) => {
    if (params instanceof vscode.Uri) {
      fileSystemProvider.createPanel(params.fsPath);
    } else if (typeof params === "string") {
      fileSystemProvider.createPanel(params);
    } else {
      const { workspaceFolders } = vscode.workspace;
      if (workspaceFolders?.length) {
        fileSystemProvider.createPanel(workspaceFolders[0].uri.fsPath);
      } else {
        vscode.window.showErrorMessage("請提供資料夾路徑或先開啟一個工作區資料夾");
      }
    }
  });

  commandManager.register("1ureka.fileSystem.openFromDialog", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (!folders || folders.length === 0) return;
    else fileSystemProvider.createPanel(folders[0].fsPath);
  });

  commandManager.register("1ureka.fileSystem.refresh", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<ReadDirAPI>(panel, "readDirectory");
  });

  commandManager.register("1ureka.fileSystem.createFolder", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CreateDirAPI>(panel, "createDir");
  });

  commandManager.register("1ureka.fileSystem.createFile", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CreateFileAPI>(panel, "createFile");
  });

  commandManager.register("1ureka.fileSystem.openInWorkspace", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<OpenInWorkspaceAPI>(panel, "openInWorkspace");
  });

  commandManager.register("1ureka.fileSystem.openInTerminal", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<OpenInTerminalAPI>(panel, "openInTerminal");
  });

  commandManager.register("1ureka.fileSystem.openInImageWall", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<OpenInImageWallAPI>(panel, "openInImageWall");
  });

  commandManager.register("1ureka.fileSystem.filterAll", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<FilterAllAPI>(panel, "filterAll");
  });

  commandManager.register("1ureka.fileSystem.filterFolders", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<FilterFoldersAPI>(panel, "filterFolders");
  });

  commandManager.register("1ureka.fileSystem.filterFiles", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<FilterFilesAPI>(panel, "filterFiles");
  });

  commandManager.register("1ureka.fileSystem.copyNames", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CopyNameAPI>(panel, "copyNamesToSystemClipboard");
  });

  commandManager.register("1ureka.fileSystem.copyPaths", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CopyPathAPI>(panel, "copyPathsToSystemClipboard");
  });
}
