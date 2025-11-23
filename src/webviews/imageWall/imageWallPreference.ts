import { create } from "zustand";

type ImageWallPreferenceState = {
  mode: "standard" | "woven" | "masonry";
  columnSize: "s" | "m" | "l";
};

const imageWallPreferenceStore = create<ImageWallPreferenceState>(() => ({
  mode: "masonry",
  columnSize: "m",
}));

const setImageWallPreference = (preference: Partial<ImageWallPreferenceState>) => {
  imageWallPreferenceStore.setState((state) => ({ ...state, ...preference }));
};

export { imageWallPreferenceStore, setImageWallPreference, type ImageWallPreferenceState };
