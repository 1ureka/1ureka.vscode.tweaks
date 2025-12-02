import { useEffect, useRef, useState } from "react";

/** 延遲指定毫秒數 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 使用 async/await 解碼圖片，如果解碼失敗，將進行重試直到成功。*/
async function decode(image: HTMLImageElement, attempt = 0): Promise<void> {
  try {
    await image.decode();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    if (attempt < 1000) {
      await decode(image, attempt + 1);
    } else {
      throw new Error(`Reached maximum decode attempts (1000)`);
    }
  }
}

/** 解碼圖片並回傳解碼後的圖片 URL 及解碼狀態 */
const useDecodeImage = (src: string | null): [string | null, boolean] => {
  const [state, setState] = useState(false);
  const [_src, setSrc] = useState<string | null>(null);
  const timeStamp = useRef<number | null>(null);

  const decoding = (url: string, createAt: number) => {
    const img = new Image();
    img.src = url;

    (async () => {
      await delay(250);
      await decode(img);
      if (createAt !== timeStamp.current) return;
      setSrc(url);
      setState(true);
    })();
  };

  useEffect(() => {
    timeStamp.current = Date.now();
    setState(false);
    if (src) decoding(src, timeStamp.current);
  }, [src]);

  return [_src, state];
};

export { useDecodeImage };
