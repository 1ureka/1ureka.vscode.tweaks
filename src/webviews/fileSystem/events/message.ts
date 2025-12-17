import { onReceiveCommand } from "@/utils/message_client";
import type { ReadDirAPI, CreateDirAPI, CreateFileAPI } from "@/providers/fileSystemProvider";
import { openInImageWall, openInTerminal, openInWorkspace, refresh } from "@@/fileSystem/action/navigation";
import { createNewFile, createNewFolder } from "@@/fileSystem/action/operation";
import { setFilter } from "@@/fileSystem/action/view";
import { handleCopyToSystem } from "@@/fileSystem/action/clipboard";

type FilterAllAPI = { id: "filterAll"; handler: () => void };
type FilterFoldersAPI = { id: "filterFolders"; handler: () => void };
type FilterFilesAPI = { id: "filterFiles"; handler: () => void };

export type { FilterAllAPI, FilterFoldersAPI, FilterFilesAPI };

type OpenInImageWallAPI = { id: "openInImageWall"; handler: () => void };
type OpenInTerminalAPI = { id: "openInTerminal"; handler: () => void };
type OpenInWorkspaceAPI = { id: "openInWorkspace"; handler: () => void };

export type { OpenInWorkspaceAPI, OpenInTerminalAPI, OpenInImageWallAPI };

type CopyNameAPI = { id: "copyNamesToSystemClipboard"; handler: () => void };
type CopyPathAPI = { id: "copyPathsToSystemClipboard"; handler: () => void };

export type { CopyNameAPI, CopyPathAPI };

const registerMessageEvents = async () => {
  onReceiveCommand<ReadDirAPI>("readDirectory", refresh);
  onReceiveCommand<CreateDirAPI>("createDir", createNewFolder);
  onReceiveCommand<CreateFileAPI>("createFile", createNewFile);
  onReceiveCommand<OpenInWorkspaceAPI>("openInWorkspace", openInWorkspace);
  onReceiveCommand<OpenInTerminalAPI>("openInTerminal", openInTerminal);
  onReceiveCommand<OpenInImageWallAPI>("openInImageWall", openInImageWall);
  onReceiveCommand<FilterAllAPI>("filterAll", () => setFilter("all"));
  onReceiveCommand<FilterFoldersAPI>("filterFolders", () => setFilter("folder"));
  onReceiveCommand<FilterFilesAPI>("filterFiles", () => setFilter("file"));
  onReceiveCommand<CopyNameAPI>("copyNamesToSystemClipboard", () => handleCopyToSystem({ mode: "names" }));
  onReceiveCommand<CopyPathAPI>("copyPathsToSystemClipboard", () => handleCopyToSystem({ mode: "paths" }));
};

export { registerMessageEvents };
