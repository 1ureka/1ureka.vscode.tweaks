import { create } from "zustand";
import { onReceiveCommand } from "@/utils/message_client";

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

type SetModeStandardAPI = { id: "setModeStandard"; handler: () => void };
type SetModeWovenAPI = { id: "setModeWoven"; handler: () => void };
type SetModeMasonryAPI = { id: "setModeMasonry"; handler: () => void };
type SetSizeSmallAPI = { id: "setSizeSmall"; handler: () => void };
type SetSizeMediumAPI = { id: "setSizeMedium"; handler: () => void };
type SetSizeLargeAPI = { id: "setSizeLarge"; handler: () => void };

const registerPreferenceEvent = () => {
  onReceiveCommand<SetModeStandardAPI>("setModeStandard", () => setImageWallPreference({ mode: "standard" }));
  onReceiveCommand<SetModeWovenAPI>("setModeWoven", () => setImageWallPreference({ mode: "woven" }));
  onReceiveCommand<SetModeMasonryAPI>("setModeMasonry", () => setImageWallPreference({ mode: "masonry" }));
  onReceiveCommand<SetSizeSmallAPI>("setSizeSmall", () => setImageWallPreference({ columnSize: "s" }));
  onReceiveCommand<SetSizeMediumAPI>("setSizeMedium", () => setImageWallPreference({ columnSize: "m" }));
  onReceiveCommand<SetSizeLargeAPI>("setSizeLarge", () => setImageWallPreference({ columnSize: "l" }));
};

export type { SetModeStandardAPI, SetModeWovenAPI, SetModeMasonryAPI };
export type { SetSizeSmallAPI, SetSizeMediumAPI, SetSizeLargeAPI };
export { registerPreferenceEvent, imageWallPreferenceStore };
