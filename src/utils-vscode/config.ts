import * as vscode from "vscode";
import type { ConfigId } from "@/contribute";

/**
 * 提供獲取配置的工具函數
 */
function getConfig<T = string>(id: ConfigId): T | undefined {
  const parts = id.split(".");
  if (parts.length !== 2) return undefined;

  const prefix = parts[0];
  if (prefix !== "1ureka") return undefined;

  const key = parts[1];
  if (!key) return undefined;

  const config = vscode.workspace.getConfiguration(prefix);
  return config.get<T>(key);
}

export { getConfig };
