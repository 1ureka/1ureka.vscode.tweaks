import { onReceiveCommand } from "@/utils/message_client";
import { refresh } from "./navigate";
import { setFilter } from "./view";
import { createNewFile, createNewFolder, openInWorkspace, openInTerminal, openInImageWall } from "./action";
import type { ReadDirAPI, CreateDirAPI, CreateFileAPI } from "@/providers/fileSystemProvider";

type FilterAllAPI = { id: "filterAll"; handler: () => void };
type FilterFoldersAPI = { id: "filterFolders"; handler: () => void };
type FilterFilesAPI = { id: "filterFiles"; handler: () => void };

export type { FilterAllAPI, FilterFoldersAPI, FilterFilesAPI };

type OpenInImageWallAPI = { id: "openInImageWall"; handler: () => void };
type OpenInTerminalAPI = { id: "openInTerminal"; handler: () => void };
type OpenInWorkspaceAPI = { id: "openInWorkspace"; handler: () => void };

export type { OpenInWorkspaceAPI, OpenInTerminalAPI, OpenInImageWallAPI };

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
};

export { registerMessageEvents };
