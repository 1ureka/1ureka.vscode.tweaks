declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const value: string;
  export default value;
}

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
};
