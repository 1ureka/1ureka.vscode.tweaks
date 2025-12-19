import { onReceiveCommand } from "@/utils/message_client";
import type { ReadDirAPI, CreateDirAPI, CreateFileAPI } from "@/providers/fileSystemProvider";
import { openInImageWall, openInTerminal, openInWorkspace, refresh } from "@@/fileSystem/action/navigation";
import { createNewFile, createNewFolder } from "@@/fileSystem/action/operation";

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
};

export { registerMessageEvents };
