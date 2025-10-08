import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForUpdates() {
  try {
    const update = await check();

    if (update?.available) {
      return {
        available: true,
        currentVersion: update.currentVersion,
        version: update.version,
        date: update.date,
        body: update.body,
      };
    }

    return {
      available: false,
      currentVersion: null,
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return {
      available: false,
      error: error.message,
    };
  }
}

export async function downloadAndInstallUpdate(update, onProgress) {
  try {
    await update.downloadAndInstall((progress) => {
      if (onProgress) {
        onProgress(progress);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to download and install update:', error);
    return { success: false, error: error.message };
  }
}

export async function restartApp() {
  try {
    await relaunch();
  } catch (error) {
    console.error('Failed to restart app:', error);
  }
}

