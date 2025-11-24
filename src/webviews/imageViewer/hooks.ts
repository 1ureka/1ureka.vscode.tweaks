import { useEffect } from "react";
import { postMessageToExtension } from "../utils/vscodeApi";

const useEyeDropper = () => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const message = event.data;
      if (message.type !== "eyeDropper") return;

      const eyeDropper = new EyeDropper();
      try {
        const result = await eyeDropper.open();
        postMessageToExtension({ type: "eyeDropper", color: result.sRGBHex });
      } catch (error) {
        postMessageToExtension({ type: "error", error: "顏色選取失敗" });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
};

export { useEyeDropper };
