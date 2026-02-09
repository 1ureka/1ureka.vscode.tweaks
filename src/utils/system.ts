import open from "open";
import * as path from "path";
import { tryCatch } from "@/utils";

/**
 * 允許開啟的副檔名白名單
 */
const AllowedFiles = [".blend", ".spp", ".html"];

/**
 * 使用系統預設應用打開指定檔案
 */
async function openWithDefaultApp(params: {
  filePath: string;
  askForConfirmation: (message: string) => Promise<boolean>;
  showError: (message: string) => void;
}) {
  const { filePath, askForConfirmation, showError } = params;
  const fileExt = path.extname(filePath).toLowerCase();

  let proceed = false;
  if (!AllowedFiles.includes(fileExt)) {
    proceed = await askForConfirmation(`此功能只支援開啟 [${AllowedFiles.join(", ")}]，檔案類型不符，是否仍要繼續？`);
  } else {
    proceed = true;
  }

  if (!proceed) return;

  const result = await tryCatch(() => open(filePath, { wait: false }));
  if (result.error) {
    showError(`無法使用系統預設應用程式開啟檔案：${result.error.message}`);
  }
}

export { openWithDefaultApp };
