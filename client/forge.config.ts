import type { ForgeConfig } from "@electron-forge/shared-types";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerZIP } from "@electron-forge/maker-zip";

const config: ForgeConfig = {
  packagerConfig: {
    name: "Waken",
  },
  makers: [
    new MakerSquirrel({ name: "Waken" }),
    new MakerDMG({ name: "Waken" }),
    new MakerZIP({}, ["darwin", "win32"]),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/app/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/app/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.config.ts",
        },
      ],
    }),
  ],
};

export default config;
