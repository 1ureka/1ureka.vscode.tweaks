import { describe, it, expect, beforeAll } from "vitest";
import { listSystemFolders, listVolumes, DriveType, type SystemFolder } from "@/utils/system-windows";

describe("system_windows", () => {
  describe("listSystemFolders", () => {
    let folders: SystemFolder[];

    beforeAll(async () => {
      folders = await listSystemFolders();
    });

    it("應該返回包含 Name 和 Path 屬性的陣列", () => {
      expect(Array.isArray(folders)).toBe(true);

      if (folders.length > 0) {
        folders.forEach((folder) => {
          expect(folder).toHaveProperty("Name");
          expect(folder).toHaveProperty("Path");
          expect(typeof folder.Name).toBe("string");
          expect(typeof folder.Path).toBe("string");
          expect(folder.Path.length).toBeGreaterThan(0);
        });
      }
    });

    it("應該返回至少一個系統資料夾", () => {
      expect(folders.length).toBeGreaterThan(0);
    });

    it("Path 應該是有效的 Windows 路徑格式", () => {
      if (folders.length > 0) {
        folders.forEach((folder) => {
          // Windows 路徑應該包含磁碟代號或是 UNC 路徑
          const isValidPath =
            /^[A-Z]:\\/i.test(folder.Path) || // 本地路徑 (C:\...)
            /^\\\\/.test(folder.Path); // UNC 路徑 (\\...)

          expect(isValidPath).toBe(true);
        });
      }
    });
  });

  describe("listVolumes", () => {
    let volumns: Awaited<ReturnType<typeof listVolumes>>;

    beforeAll(async () => {
      volumns = await listVolumes();
    });

    it("應該返回包含完整磁碟資訊屬性的陣列", () => {
      expect(Array.isArray(volumns)).toBe(true);

      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(volumn).toHaveProperty("DeviceID");
          expect(volumn).toHaveProperty("VolumeName");
          expect(volumn).toHaveProperty("FreeSpace");
          expect(volumn).toHaveProperty("Size");
          expect(volumn).toHaveProperty("FileSystem");
          expect(volumn).toHaveProperty("DriveType");
        });
      }
    });

    it("應該返回至少一個磁碟資訊", () => {
      expect(volumns.length).toBeGreaterThan(0);
    });

    it("DeviceID 應該是有效的磁碟代號格式", () => {
      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(typeof volumn.DeviceID).toBe("string");
          expect(/^[A-Z]:$/i.test(volumn.DeviceID)).toBe(true);
        });
      }
    });

    it("VolumeName 應該是字串或 null", () => {
      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(volumn.VolumeName === null || typeof volumn.VolumeName === "string").toBe(true);
        });
      }
    });

    it("FreeSpace 和 Size 應該是數字或 null", () => {
      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(volumn.FreeSpace === null || typeof volumn.FreeSpace === "number").toBe(true);
          expect(volumn.Size === null || typeof volumn.Size === "number").toBe(true);

          // 如果都有值,FreeSpace 應該小於等於 Size
          if (typeof volumn.FreeSpace === "number" && typeof volumn.Size === "number") {
            expect(volumn.FreeSpace).toBeLessThanOrEqual(volumn.Size);
            expect(volumn.FreeSpace).toBeGreaterThanOrEqual(0);
            expect(volumn.Size).toBeGreaterThan(0);
          }
        });
      }
    });

    it("FileSystem 應該是字串或 null", () => {
      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(volumn.FileSystem === null || typeof volumn.FileSystem === "string").toBe(true);
        });
      }
    });

    it("DriveType 應該是有效的 DriveType 枚舉值", () => {
      const validDriveTypes = Object.values(DriveType).filter((v) => typeof v === "number");

      if (volumns.length > 0) {
        volumns.forEach((volumn) => {
          expect(typeof volumn.DriveType).toBe("number");
          expect(validDriveTypes).toContain(volumn.DriveType);
          expect(volumn.DriveType).toBeGreaterThanOrEqual(0);
          expect(volumn.DriveType).toBeLessThanOrEqual(6);
        });
      }
    });

    it("應該至少包含一個本地磁碟 (LocalDisk)", () => {
      const localDisks = volumns.filter((v) => v.DriveType === DriveType.LocalDisk);

      // Windows 系統至少會有一個本地磁碟 (通常是 C:)
      expect(localDisks.length).toBeGreaterThan(0);
    });

    it("本地磁碟應該有完整的資訊", () => {
      const localDisks = volumns.filter((v) => v.DriveType === DriveType.LocalDisk);

      if (localDisks.length > 0) {
        localDisks.forEach((disk) => {
          expect(typeof disk.DeviceID).toBe("string");
          expect(typeof disk.FileSystem).toBe("string");
          expect(typeof disk.Size).toBe("number");
          expect(typeof disk.FreeSpace).toBe("number");
          expect(disk.Size).toBeGreaterThan(0);
        });
      }
    });
  });
});
