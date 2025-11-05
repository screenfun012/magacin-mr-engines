import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/**
 * Get current app version
 */
export function getCurrentVersion() {
  return '1.2.0'; // This matches package.json and tauri.conf.json
}

/**
 * Check for available updates
 */
export async function checkForUpdates() {
  try {
    const update = await check();

    if (update?.available) {
      return {
        available: true,
        currentVersion: update.currentVersion || getCurrentVersion(),
        version: update.version,
        date: update.date,
        body: update.body || 'Nova verzija je dostupna!',
        update: update, // Keep reference for download
      };
    }

    return {
      available: false,
      currentVersion: getCurrentVersion(),
      message: 'Aplikacija je ažurna!',
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return {
      available: false,
      currentVersion: getCurrentVersion(),
      error: error.message || 'Greška pri proveri update-a',
    };
  }
}

/**
 * Download and install update
 * @param {Object} updateInfo - Update info object from checkForUpdates
 * @param {Function} onProgress - Progress callback (receives {downloaded, total, percentage})
 */
export async function downloadAndInstallUpdate(updateInfo, onProgress) {
  try {
    const update = updateInfo.update;
    
    if (!update) {
      throw new Error('No update object provided');
    }

    let lastProgress = 0;

    await update.downloadAndInstall((progress) => {
      if (onProgress && progress.chunkLength && progress.contentLength) {
        lastProgress += progress.chunkLength;
        const percentage = Math.round((lastProgress / progress.contentLength) * 100);
        
        onProgress({
          downloaded: lastProgress,
          total: progress.contentLength,
          percentage: Math.min(percentage, 100),
        });
      }
    });

    return { success: true, message: 'Update uspešno instaliran!' };
  } catch (error) {
    console.error('Failed to download and install update:', error);
    return {
      success: false,
      error: error.message || 'Greška pri instalaciji update-a',
    };
  }
}

/**
 * Restart application (call after successful install)
 */
export async function restartApp() {
  try {
    await relaunch();
    return { success: true };
  } catch (error) {
    console.error('Failed to restart app:', error);
    return {
      success: false,
      error: error.message || 'Greška pri restartovanju aplikacije',
    };
  }
}

