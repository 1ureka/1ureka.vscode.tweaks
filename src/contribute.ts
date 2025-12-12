import type { OneOf } from "@/utils";

// ============================================================================
// Command IDs and Webview IDs
// ============================================================================

type CommandId =
  | "1ureka.main.openNavigation"
  // External App Commands
  | "1ureka.external.openBlender"
  | "1ureka.external.openWithBlender"
  | "1ureka.external.openPainter"
  | "1ureka.external.openWithPainter"
  | "1ureka.external.openWithBrowser"
  // Image Wall Commands
  | "1ureka.imageWall.openFromPath"
  | "1ureka.imageWall.openFromDialog"
  | "1ureka.imageWall.setLayoutStandard"
  | "1ureka.imageWall.setLayoutWoven"
  | "1ureka.imageWall.setLayoutMasonry"
  | "1ureka.imageWall.setSizeSmall"
  | "1ureka.imageWall.setSizeMedium"
  | "1ureka.imageWall.setSizeLarge"
  // Image Viewer Commands
  | "1ureka.imageViewer.resetTransform"
  | "1ureka.imageViewer.eyeDropper"
  | "1ureka.imageViewer.exportAs"
  // File System Commands
  | "1ureka.fileSystem.openFromPath"
  | "1ureka.fileSystem.openFromDialog"
  | "1ureka.fileSystem.refresh"
  | "1ureka.fileSystem.createFolder"
  | "1ureka.fileSystem.createFile"
  | "1ureka.fileSystem.openInWorkspace"
  | "1ureka.fileSystem.openInTerminal"
  | "1ureka.fileSystem.openInImageWall"
  | "1ureka.fileSystem.filterAll"
  | "1ureka.fileSystem.filterFolders"
  | "1ureka.fileSystem.filterFiles"
  | "1ureka.fileSystem.copyPaths"
  | "1ureka.fileSystem.copyNames"
  | "1ureka.fileSystem.rename"
  // Inject Styles Commands
  | "1ureka.injectStyles"
  | "1ureka.restoreStyles"
  | "1ureka.restoreAndReinjectStyles";

type WebviewId = "1ureka.imageViewer" | "1ureka.imageWall" | "1ureka.fileSystem";

type ConfigPrefix = "1ureka";

type ConfigKey = "vscodeResourcePath" | "blenderPath" | "painterPath";

type ConfigId = `${ConfigPrefix}.${ConfigKey}`;

export type { CommandId, WebviewId, ConfigId };

// ============================================================================
// Type Definitions
// ============================================================================

type CommandEntry = {
  id: CommandId;
  title: string;
  icon?: `$(${string})`;
  when?: string;
  group?: string;
};

type SubmenuEntry = {
  submenuId: string;
  label: string;
  when?: string;
  group?: string;
  commandEntries: OneOf<[Omit<CommandEntry, "when">, SubmenuEntry]>[];
};

type WebviewCommandEntry = Omit<CommandEntry, "when"> & {
  webviewId: WebviewId;
};

type WebviewSubmenuEntry = Omit<SubmenuEntry, "when"> & {
  webviewId: WebviewId;
};

type CommandPaletteEntries = CommandEntry[];
type ContextMenuEntries = OneOf<[CommandEntry, SubmenuEntry]>[];
type WebviewContextMenuEntries = OneOf<[WebviewCommandEntry, WebviewSubmenuEntry]>[];

type CustomEditor = {
  viewType: string;
  displayName: string;
  selector: Array<{ filenamePattern: string }>;
  priority: "default" | "option";
};

// ============================================================================
// Configuration Entries
// ============================================================================

const commandPaletteEntries: CommandPaletteEntries = [
  { id: "1ureka.external.openBlender", title: "開啟 Blender", when: "isWindows" },
  { id: "1ureka.external.openPainter", title: "開啟 Painter", when: "isWindows" },
  { id: "1ureka.imageWall.openFromDialog", title: "開啟圖片牆", icon: "$(repo)" },
  { id: "1ureka.fileSystem.openFromDialog", title: "開啟系統瀏覽器", icon: "$(folder-library)" },
  { id: "1ureka.injectStyles", title: "注入自訂樣式" },
  { id: "1ureka.restoreStyles", title: "還原樣式設定" },
  { id: "1ureka.restoreAndReinjectStyles", title: "還原並重新注入樣式" },
];

const explorerTitleMenuEntries: ContextMenuEntries = [
  {
    id: "1ureka.main.openNavigation",
    title: "1ureka 的擴展插件",
    when: "view == workbench.explorer.fileView",
    group: "navigation",
    icon: "$(sparkle)",
  },
];

const editorTitleMenuEntries: ContextMenuEntries = [
  {
    id: "1ureka.main.openNavigation",
    title: "1ureka 的擴展插件",
    when: "true",
    group: "navigation",
    icon: "$(sparkle)",
  },
];

const explorerContextMenuEntries: ContextMenuEntries = [
  {
    id: "1ureka.external.openWithBlender",
    title: "以 Blender 開啟",
    when: "resourceExtname == .blend",
    group: "navigation@100",
  },
  {
    id: "1ureka.external.openWithPainter",
    title: "以 Painter 開啟",
    when: "resourceExtname == .spp",
    group: "navigation@100",
  },
  {
    id: "1ureka.external.openWithBrowser",
    title: "以網頁瀏覽器開啟",
    when: "resourceExtname == .html",
    group: "navigation@100",
  },
  {
    id: "1ureka.fileSystem.openFromPath",
    title: "在系統瀏覽器中顯示",
    when: "explorerResourceIsFolder",
    group: "extension@100",
  },
  {
    id: "1ureka.imageWall.openFromPath",
    title: "在圖片牆中顯示",
    when: "explorerResourceIsFolder",
    group: "extension@101",
  },
];

const editorTitleContextMenuEntries: ContextMenuEntries = [
  {
    id: "1ureka.external.openWithBlender",
    title: "以 Blender 開啟",
    when: "resourceExtname == .blend",
    group: "navigation@100",
  },
  {
    id: "1ureka.external.openWithPainter",
    title: "以 Painter 開啟",
    when: "resourceExtname == .spp",
    group: "navigation@100",
  },
  {
    id: "1ureka.external.openWithBrowser",
    title: "以網頁瀏覽器開啟",
    when: "resourceExtname == .html",
    group: "navigation@100",
  },
];

const webviewContextMenuEntries: WebviewContextMenuEntries = [
  // Image Viewer
  {
    id: "1ureka.imageViewer.resetTransform",
    title: "重設圖片縮放與位置",
    webviewId: "1ureka.imageViewer",
    group: "navigation@100",
  },
  {
    id: "1ureka.imageViewer.eyeDropper",
    title: "吸取顏色並複製",
    webviewId: "1ureka.imageViewer",
    group: "navigation@100",
  },
  {
    id: "1ureka.imageViewer.exportAs",
    title: "導出為...",
    webviewId: "1ureka.imageViewer",
    group: "navigation@101",
  },

  // Image Wall
  {
    submenuId: "imageWall.layout",
    label: "圖片牆布局",
    webviewId: "1ureka.imageWall",
    group: "0_preferences",
    commandEntries: [
      { id: "1ureka.imageWall.setLayoutStandard", title: "標準布局", group: "1_modes@1" },
      { id: "1ureka.imageWall.setLayoutWoven", title: "編織布局", group: "1_modes@2" },
      { id: "1ureka.imageWall.setLayoutMasonry", title: "磚牆布局 (預設)", group: "1_modes@3" },
    ],
  },
  {
    submenuId: "imageWall.size",
    label: "圖片牆尺寸",
    webviewId: "1ureka.imageWall",
    group: "0_preferences",
    commandEntries: [
      { id: "1ureka.imageWall.setSizeSmall", title: "小尺寸", group: "1_sizes@1" },
      { id: "1ureka.imageWall.setSizeMedium", title: "中尺寸 (預設)", group: "1_sizes@2" },
      { id: "1ureka.imageWall.setSizeLarge", title: "大尺寸", group: "1_sizes@3" },
    ],
  },

  // File System
  {
    id: "1ureka.fileSystem.refresh",
    title: "重新整理",
    webviewId: "1ureka.fileSystem",
    group: "navigation@100",
  },
  {
    submenuId: "fileSystem.openIn",
    label: "在此開啟...",
    webviewId: "1ureka.fileSystem",
    group: "navigation@101",
    commandEntries: [
      { id: "1ureka.fileSystem.openInWorkspace", title: "新工作區", group: "1_openIn@1" },
      { id: "1ureka.fileSystem.openInTerminal", title: "終端機", group: "1_openIn@2" },
      { id: "1ureka.fileSystem.openInImageWall", title: "圖片牆", group: "1_openIn@3" },
    ],
  },
  {
    submenuId: "fileSystem.create",
    label: "在此新增...",
    webviewId: "1ureka.fileSystem",
    group: "navigation@102",
    commandEntries: [
      { id: "1ureka.fileSystem.createFolder", title: "資料夾", group: "1_create@1" },
      { id: "1ureka.fileSystem.createFile", title: "檔案", group: "1_create@2" },
    ],
  },
  {
    submenuId: "fileSystem.filter",
    label: "篩選",
    webviewId: "1ureka.fileSystem",
    group: "view@100",
    commandEntries: [
      { id: "1ureka.fileSystem.filterAll", title: "顯示全部", group: "1_filter@1" },
      { id: "1ureka.fileSystem.filterFolders", title: "僅顯示資料夾", group: "1_filter@2" },
      { id: "1ureka.fileSystem.filterFiles", title: "僅顯示檔案", group: "1_filter@3" },
    ],
  },
  {
    id: "1ureka.fileSystem.copyPaths",
    title: "複製路徑",
    webviewId: "1ureka.fileSystem",
    // group: "5_cutcopypaste@1", 這是預設的位置
    group: "6_cutcopypaste@1",
  },
  {
    id: "1ureka.fileSystem.copyNames",
    title: "複製名稱",
    webviewId: "1ureka.fileSystem",
    group: "6_cutcopypaste@1",
  },
  {
    id: "1ureka.fileSystem.rename",
    title: "重新命名",
    webviewId: "1ureka.fileSystem",
    group: "7_modification@1",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const configuration: { title: string; properties: Record<ConfigId, any> } = {
  title: "1ureka's Extensions",
  properties: {
    "1ureka.vscodeResourcePath": {
      type: "string",
      scope: "machine",
      default: "",
      markdownDescription:
        "設定 VSCode 資源目錄路徑,用於自訂樣式注入功能。\n\n範例：`C:/Users/YourName/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs`",
    },
    "1ureka.blenderPath": {
      type: "string",
      scope: "machine",
      default: "",
      markdownDescription:
        "設定 Blender 執行檔路徑。若未設定,將自動搜尋常見安裝位置。\n\n範例：`C:/Program Files/Blender Foundation/Blender 4.0/blender.exe`",
    },
    "1ureka.painterPath": {
      type: "string",
      scope: "machine",
      default: "",
      markdownDescription:
        "設定 Adobe Substance 3D Painter 執行檔路徑。若未設定,將自動搜尋常見安裝位置。\n\n範例：`C:/Program Files/Adobe/Adobe Substance 3D Painter/Adobe Substance 3D Painter.exe`",
    },
  },
};

const customEditors: CustomEditor[] = [
  {
    viewType: "1ureka.imageViewer",
    displayName: "圖片檢視器",
    selector: [{ filenamePattern: "*.{jpg,jpeg,png,gif,bmp,webp,tiff,tif}" }],
    priority: "default",
  },
];

// ============================================================================
// Generate Contribute Function
// ============================================================================

/**
 * 生成 VS Code 擴充套件的 contributes 設定
 * @returns 包含 commands、customEditors、menus 和 submenus 的完整 contributes 物件
 */
export function generateContribute() {
  const allCommandIds = new Set<CommandId>();
  const commandTitleMap = new Map<string, string>();
  const commandIconMap = new Map<string, `$(${string})`>();
  const submenus: Array<{ id: string; label: string }> = [];
  const submenuMenus: Record<string, Array<{ command?: string; submenu?: string; group?: string }>> = {};

  /**
   * 從命令條目中提取命令 ID 和標題
   * @param entry 命令條目
   */
  function extractFromCommandEntry(entry: CommandEntry): void {
    allCommandIds.add(entry.id);
    commandTitleMap.set(entry.id, entry.title);
    if (entry.icon) commandIconMap.set(entry.id, entry.icon);
  }

  /**
   * 從子選單條目中遞迴提取所有命令和子選單資訊
   * @param entry 子選單條目
   */
  function extractFromSubmenuEntry(entry: SubmenuEntry): void {
    submenus.push({ id: entry.submenuId, label: entry.label });

    const submenuItems: Array<{ command?: string; submenu?: string; group?: string }> = [];

    entry.commandEntries.forEach((entry) => {
      const isEntryCommand = "id" in entry;
      const isEntrySubmenu = "submenuId" in entry;

      if (isEntryCommand) {
        submenuItems.push({ command: entry.id, group: entry.group });
        extractFromCommandEntry(entry);
      }
      if (isEntrySubmenu) {
        submenus.push({ id: entry.submenuId, label: entry.label });
        submenuItems.push({ submenu: entry.submenuId, group: entry.group });
        extractFromSubmenuEntry(entry);
      }
    });

    submenuMenus[entry.submenuId] = submenuItems;
  }

  /**
   * 從條目陣列中提取命令和子選單資訊
   * @param entries 命令或子選單條目的陣列
   */
  function extract(entries: OneOf<[CommandEntry, SubmenuEntry]>[]): void {
    entries.forEach((entry) => {
      const isEntryCommand = "id" in entry;
      const isEntrySubmenu = "submenuId" in entry;

      if (isEntryCommand) {
        extractFromCommandEntry(entry);
      }
      if (isEntrySubmenu) {
        extractFromSubmenuEntry(entry);
      }
    });
  }

  // 收集來自各個來源的命令和子選單
  extract(commandPaletteEntries);
  extract(explorerTitleMenuEntries);
  extract(explorerContextMenuEntries);
  extract(editorTitleMenuEntries);
  extract(editorTitleContextMenuEntries);
  extract(webviewContextMenuEntries);

  // ---------------------------------------------------------------------------

  /**
   * 生成所有命令的註冊配置
   * @returns 命令註冊陣列
   */
  function generateCommandsRegistration() {
    return Array.from(allCommandIds).map((id) => {
      const base = { command: id, title: commandTitleMap.get(id) || id };
      const icon = commandIconMap.get(id);
      return icon ? { ...base, icon } : base;
    });
  }

  /**
   * 生成命令面板的選單註冊配置
   * @param entries 命令面板條目
   * @returns 命令面板選單註冊陣列
   */
  function generateCommandPaletteRegistration(entries: CommandPaletteEntries) {
    return Array.from(allCommandIds).map((id) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return { command: id, when: "false" }; // 沒有顯式定義代表該命令不希望出現在命令面板中
      if (!entry.when) return { command: id }; // 沒有定義 when 條件代表該命令總是顯示，對應的註冊方式就是不帶 when
      return { command: id, when: entry.when };
    });
  }

  /**
   * 生成一般右鍵選單的註冊配置
   * @param entries 右鍵選單條目
   * @returns 選單註冊陣列
   */
  function generateMenuRegistration(entries: ContextMenuEntries) {
    return entries.map((entry) => {
      if ("id" in entry) return { command: entry.id, when: entry.when, group: entry.group };
      else return { submenu: entry.submenuId, when: entry.when, group: entry.group };
    });
  }

  /**
   * 生成 WebView 右鍵選單的註冊配置
   * @param entries WebView 右鍵選單條目
   * @returns 選單註冊陣列
   */
  function generateWebviewMenuRegistration(entries: WebviewContextMenuEntries) {
    return entries.map((entry) => {
      const when = `webviewId == '${entry.webviewId}'`;
      if ("id" in entry) return { command: entry.id, when, group: entry.group };
      else return { submenu: entry.submenuId, when, group: entry.group };
    });
  }

  // 建構 contribute 物件的各個部分
  const commands = generateCommandsRegistration();
  const commandPaletteMenu = generateCommandPaletteRegistration(commandPaletteEntries);
  const explorerContextMenu = generateMenuRegistration(explorerContextMenuEntries);
  const explorerTitleMenu = generateMenuRegistration(explorerTitleMenuEntries);
  const editorTitleMenu = generateMenuRegistration(editorTitleMenuEntries);
  const editorTitleContextMenu = generateMenuRegistration(editorTitleContextMenuEntries);
  const webviewContextMenu = generateWebviewMenuRegistration(webviewContextMenuEntries);

  // ---------------------------------------------------------------------------

  // 建構 menus 物件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const menus: Record<string, Array<any>> = {
    commandPalette: commandPaletteMenu,
    "explorer/context": explorerContextMenu,
    "editor/title/context": editorTitleContextMenu,
    "webview/context": webviewContextMenu,
    "view/title": explorerTitleMenu,
    "editor/title": editorTitleMenu,
    ...submenuMenus,
  };

  return { commands, customEditors, menus, submenus, configuration };
}
