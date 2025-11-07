import { invoke } from '@tauri-apps/api/core';

const GITHUB_REPO = 'screenfun012/magacin-mr-engines';
const CURRENT_VERSION = '1.2.4'; // Automatski se menja sa version-bump skriptom

/**
 * Get current app version
 */
export function getCurrentVersion() {
  return CURRENT_VERSION;
}

/**
 * Compare version strings (semver)
 */
function compareVersions(v1, v2) {
  const parts1 = v1.replace('v', '').split('.').map(Number);
  const parts2 = v2.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

/**
 * Check for available updates from GitHub Releases
 */
export async function checkForUpdates() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release = await response.json();
    const latestVersion = release.tag_name.replace('v', '');
    
    // Compare versions
    const hasUpdate = compareVersions(latestVersion, CURRENT_VERSION) > 0;

    if (hasUpdate) {
      // Find Windows MSI asset
      const msiAsset = release.assets.find(
        asset => asset.name.endsWith('.msi') && asset.name.includes('x64')
      );

      return {
        available: true,
        currentVersion: CURRENT_VERSION,
        version: latestVersion,
        date: release.published_at,
        body: release.body || 'Nova verzija je dostupna!',
        downloadUrl: msiAsset?.browser_download_url,
        downloadSize: msiAsset?.size,
      };
    }

    return {
      available: false,
      currentVersion: CURRENT_VERSION,
      message: 'Aplikacija je ažurna!',
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return {
      available: false,
      currentVersion: CURRENT_VERSION,
      error: error.message || 'Greška pri proveri update-a',
    };
  }
}

/**
 * Download update installer
 */
export async function downloadUpdate(downloadUrl, onProgress) {
  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0');
    const reader = response.body.getReader();
    
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (onProgress && contentLength) {
        const percentage = Math.round((receivedLength / contentLength) * 100);
        onProgress({
          downloaded: receivedLength,
          total: contentLength,
          percentage: Math.min(percentage, 100),
        });
      }
    }

    // Combine chunks
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    return {
      success: true,
      data: allChunks,
    };
  } catch (error) {
    console.error('Failed to download update:', error);
    return {
      success: false,
      error: error.message || 'Greška pri preuzimanju update-a',
    };
  }
}

/**
 * Save and run installer
 */
export async function installUpdate(installerData, version) {
  try {
    // Save to temp directory
    const tempPath = await invoke('save_temp_file', {
      data: Array.from(installerData),
      filename: `Magacin-MR-Engines_${version}_x64_en-US.msi`,
    });

    // Run installer
    await invoke('run_installer', { path: tempPath });

    return {
      success: true,
      message: 'Instalacija pokrenuta! Aplikacija će se zatvoriti.',
    };
  } catch (error) {
    console.error('Failed to install update:', error);
    return {
      success: false,
      error: error.message || 'Greška pri instalaciji update-a',
    };
  }
}

/**
 * Complete update process (download + install)
 */
export async function downloadAndInstallUpdate(updateInfo, onProgress) {
  try {
    // Download
    const downloadResult = await downloadUpdate(updateInfo.downloadUrl, onProgress);
    
    if (!downloadResult.success) {
      return downloadResult;
    }

    // Install
    const installResult = await installUpdate(downloadResult.data, updateInfo.version);
    
    return installResult;
  } catch (error) {
    console.error('Failed to download and install update:', error);
    return {
      success: false,
      error: error.message || 'Greška pri update procesu',
    };
  }
}

