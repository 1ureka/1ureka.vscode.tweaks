import type { CopyImageAPI, EyeDropperAPI, ShowErrorAPI, ShowInfoAPI } from "@/providers/imageViewerProvider";
import { invoke, onReceiveCommand } from "@/utils/message_client";

const resetTransformRef: { current: (() => void) | null } = { current: null };

type ResetTransformAPI = {
  id: "resetTransform";
  handler: () => void;
};

const registerMessageEvents = () => {
  const handleCopy = (e: ClipboardEvent) => {
    invoke<CopyImageAPI>("copyImage", undefined);
    e.preventDefault();
  };

  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    invoke<ShowInfoAPI>("showInfo", "該編輯器不支援貼上操作");
    e.preventDefault();
  });

  /** 收到訊息後啟動取色工具 */
  onReceiveCommand<EyeDropperAPI>("eyeDropper", async () => {
    const eyeDropper = new EyeDropper();
    try {
      const result = await eyeDropper.open();
      invoke<EyeDropperAPI>("eyeDropper", result.sRGBHex);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      invoke<ShowErrorAPI>("showError", "顏色選取失敗");
    }
  });

  /** 收到重設縮放指令 */
  onReceiveCommand<ResetTransformAPI>("resetTransform", () => {
    if (resetTransformRef.current) {
      const fn = resetTransformRef.current as () => void;
      fn();
    }
  });
};

export { registerMessageEvents, resetTransformRef };
export type { ResetTransformAPI };
