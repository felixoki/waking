import { app, BrowserWindow } from "electron";
import path from "path";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  else
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!BrowserWindow.getAllWindows().length) createWindow();
});
