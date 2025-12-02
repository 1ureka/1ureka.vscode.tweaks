import * as vscode from "vscode";

/**
 * 註冊一個 VSCode 命令，自動管理其生命週期，不返回，確保外部代碼無法保有該命令的引用
 */
function registerCommand(context: vscode.ExtensionContext, commandId: string, callback: (...args: any[]) => any) {
  const command = vscode.commands.registerCommand(commandId, callback);
  context.subscriptions.push(command);
}

export { registerCommand };
