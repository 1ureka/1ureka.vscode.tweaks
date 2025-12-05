import * as vscode from "vscode";
import type { CommandId } from "@/contribute";

/**
 * 提供註冊 VSCode 命令的管理器，自動管理其生命週期，先在 closure 中保存 context，這樣外部代碼無需每次都傳入 context
 */
function createCommandManager(context: vscode.ExtensionContext) {
  /**
   * 註冊一個 VSCode 命令，自動管理其生命週期，不返回，確保外部代碼無法保有該命令的引用
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const register = (commandId: CommandId, callback: (...args: any[]) => any) => {
    const command = vscode.commands.registerCommand(commandId, callback);
    context.subscriptions.push(command);
  };

  /**
   * 註冊一個沒有在 contribute 中聲明的內部命令，自動管理其生命週期，不返回，確保外部代碼無法保有該命令的引用
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registerInternal = (commandId: string, callback: (...args: any[]) => any) => {
    const command = vscode.commands.registerCommand(commandId, callback);
    context.subscriptions.push(command);
  };

  return { register, registerInternal };
}

export { createCommandManager };
