import React from "react";
import { getInitialData, postMessageToExtension } from "../utils/vscodeApi";

type ImageInfo = { uri: string; fileName: string; filePath: string };
const data = getInitialData<{ images: ImageInfo[]; folderPath: string }>() || {
  images: [],
  folderPath: "",
};

const createHandleClick = (filePath: string) => () => {
  postMessageToExtension({ type: "imageClick", filePath });
};

export const ImageWall: React.FC = () => {
  const { images, folderPath } = data;

  if (images.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h2>圖片牆</h2>
          {folderPath && <div className="folder-path">{folderPath}</div>}
        </div>
        <div className="no-images">此資料夾中沒有圖片</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h2>圖片牆</h2>
        <div className="folder-path">{folderPath}</div>
        <div className="image-count">共 {images.length} 張圖片</div>
      </div>
      <div className="image-grid">
        {images.map((image, index) => (
          <div key={index} className="image-item" onClick={createHandleClick(image.filePath)}>
            <img src={image.uri} alt={image.fileName} loading="lazy" />
            <div className="image-name">{image.fileName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
