import { copyImageBinaryToSystem } from "@/utils/system_windows";
import { generateBase64 } from "@/utils/image";

/**
 * 處理複製圖片到剪貼簿的請求
 */
const handleCopyImage = async (filePath: string, report: (params: { increment: number; message: string }) => void) => {
  report({ increment: 10, message: "正在轉碼中..." });

  const base64 = await generateBase64(filePath, "png");
  if (!base64) throw new Error("指定的路徑不是圖片檔案");

  report({ increment: 60, message: "正在傳送至剪貼簿..." });

  await copyImageBinaryToSystem(base64);

  report({ increment: 100, message: "圖片二進位資料已複製到剪貼簿" });
};

export { handleCopyImage };
