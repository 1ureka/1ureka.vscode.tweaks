import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  // Hello World command for testing
  const helloWorldCommand = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from 1ureka extension!");
  });

  context.subscriptions.push(helloWorldCommand);
}

export function deactivate() {}
