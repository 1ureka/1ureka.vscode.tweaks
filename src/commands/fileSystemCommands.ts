import * as vscode from "vscode";
import type { CreateFileAPI, CreateDirAPI, ReadDirAPI, RenameAPI } from "@/providers/fileSystemProvider";
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
    forwardCommandToWebview<ReadDirAPI>(fileSystemProvider.getCurrentPanel(), "readDirectory");
  });

  commandManager.register("1ureka.fileSystem.createFolder", () => {
    forwardCommandToWebview<CreateDirAPI>(fileSystemProvider.getCurrentPanel(), "createDir");
  });

  commandManager.register("1ureka.fileSystem.createFile", () => {
    forwardCommandToWebview<CreateFileAPI>(fileSystemProvider.getCurrentPanel(), "createFile");
  });

  commandManager.register("1ureka.fileSystem.openInWorkspace", () => {
    forwardCommandToWebview<OpenInWorkspaceAPI>(fileSystemProvider.getCurrentPanel(), "openInWorkspace");
  });

  commandManager.register("1ureka.fileSystem.openInTerminal", () => {
    forwardCommandToWebview<OpenInTerminalAPI>(fileSystemProvider.getCurrentPanel(), "openInTerminal");
  });

  commandManager.register("1ureka.fileSystem.openInImageWall", () => {
    forwardCommandToWebview<OpenInImageWallAPI>(fileSystemProvider.getCurrentPanel(), "openInImageWall");
  });

  commandManager.register("1ureka.fileSystem.filterAll", () => {
    forwardCommandToWebview<FilterAllAPI>(fileSystemProvider.getCurrentPanel(), "filterAll");
  });

  commandManager.register("1ureka.fileSystem.filterFolders", () => {
    forwardCommandToWebview<FilterFoldersAPI>(fileSystemProvider.getCurrentPanel(), "filterFolders");
  });

  commandManager.register("1ureka.fileSystem.filterFiles", () => {
    forwardCommandToWebview<FilterFilesAPI>(fileSystemProvider.getCurrentPanel(), "filterFiles");
  });

  commandManager.register("1ureka.fileSystem.copyNames", () => {
    forwardCommandToWebview<CopyNameAPI>(fileSystemProvider.getCurrentPanel(), "copyNamesToSystemClipboard");
  });

  commandManager.register("1ureka.fileSystem.copyPaths", () => {
    forwardCommandToWebview<CopyPathAPI>(fileSystemProvider.getCurrentPanel(), "copyPathsToSystemClipboard");
  });

  commandManager.register("1ureka.fileSystem.rename", () => {
    forwardCommandToWebview<RenameAPI>(fileSystemProvider.getCurrentPanel(), "rename");
  });
}
