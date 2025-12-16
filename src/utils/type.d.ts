import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    default: string;
    paper: string;
    content: string;
    input: string;
  }
  interface TypeAction {
    button: string;
    dropdown: string;
    active: string;
    border: string;
  }
  interface Palette {
    tooltip: {
      background: string;
      border: string;
    };
  }
  interface PaletteOptions {
    tooltip: {
      background: string;
      border: string;
    };
  }
}

declare global {
  declare module "*.svg" {
    const value: string;
    export default value;
  }

  declare module "*.css" {
    const value: string;
    export default value;
  }

  function acquireVsCodeApi(): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postMessage: (message: any) => void;
  };

  class EyeDropper {
    constructor();
    open(): Promise<{ sRGBHex: string }>;
  }
}
