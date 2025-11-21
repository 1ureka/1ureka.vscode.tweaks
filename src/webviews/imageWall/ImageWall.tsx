import React, { useEffect, useState } from "react";
import { onMessage, postMessage } from "../shared/vscodeApi";

interface ImageInfo {
  uri: string;
  fileName: string;
}

interface ImageWallState {
  images: ImageInfo[];
  folderPath: string;
}

export const ImageWall: React.FC = () => {
  const [state, setState] = useState<ImageWallState>({
    images: [],
    folderPath: "",
  });

  useEffect(() => {
    // 請求初始數據
    postMessage("ready");

    // 監聽來自 Extension 的消息
    const cleanup = onMessage<ImageWallState>((message) => {
      if (message.type === "update") {
        setState(message.payload!);
      }
    });

    return cleanup;
  }, []);

  if (state.images.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h2>圖片牆</h2>
          {state.folderPath && <div className="folder-path">{state.folderPath}</div>}
        </div>
        <div className="no-images">此資料夾中沒有圖片</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h2>圖片牆</h2>
        <div className="folder-path">{state.folderPath}</div>
        <div className="image-count">共 {state.images.length} 張圖片</div>
      </div>
      <div className="image-grid">
        {state.images.map((image, index) => (
          <div key={index} className="image-item">
            <img src={image.uri} alt={image.fileName} loading="lazy" />
            <div className="image-name">{image.fileName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
