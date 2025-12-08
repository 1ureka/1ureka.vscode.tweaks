/* eslint-disable */

import { vi } from "vitest";

// Mock URI
class MockUri {
  static file(path: string) {
    return { fsPath: path, scheme: "file", path };
  }
}

// Mock ThemeIcon
class MockThemeIcon {
  constructor(public id: string) {}
}

// Mock QuickPickItemKind
const MockQuickPickItemKind = {
  Separator: -1,
  Default: 0,
};

// Mock window API
const mockWindow = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showInputBox: vi.fn(),
  showQuickPick: vi.fn(),
  createTerminal: vi.fn(() => ({ show: vi.fn() })),
  showTextDocument: vi.fn(),
  withProgress: vi.fn((_options, task) => task({ report: vi.fn() })),
};

// Mock commands API
const mockCommands = {
  executeCommand: vi.fn(),
};

// Mock workspace API
const mockWorkspace = {
  openTextDocument: vi.fn(),
};

// Mock env API
const mockEnv = {
  clipboard: {
    writeText: vi.fn(),
  },
};

// Mock ViewColumn
const MockViewColumn = {
  Active: -1,
  Beside: -2,
  One: 1,
  Two: 2,
  Three: 3,
};

// Mock ProgressLocation
const MockProgressLocation = {
  Notification: 15,
};

// ----------------------------------------------

const vscode = {
  Uri: MockUri,
  ThemeIcon: MockThemeIcon,
  QuickPickItemKind: MockQuickPickItemKind,
  ViewColumn: MockViewColumn,
  ProgressLocation: MockProgressLocation,
  window: mockWindow,
  commands: mockCommands,
  workspace: mockWorkspace,
  env: mockEnv,
};

// 重置所有 mocks
function resetVscodeMocks() {
  vi.clearAllMocks();
}

export { vscode, resetVscodeMocks };
