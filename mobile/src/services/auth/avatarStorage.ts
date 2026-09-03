import * as FileSystem from 'expo-file-system/legacy';

// ImagePicker returns a URI in the OS cache, which can be purged at any time. For a guest
// avatar to survive app restarts we copy the picked image into the app's document directory
// (the same persistent location audioService uses for downloaded recordings).
const AVATAR_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}avatars/`;

/**
 * Copy a picked image into permanent app storage and return its `file://` URI.
 * Any previously-stored avatar is removed first so the folder never accumulates files and the
 * `Image` component (which caches by URI) always sees a fresh path.
 */
export async function persistAvatar(sourceUri: string): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  } else {
    try {
      const existing = await FileSystem.readDirectoryAsync(AVATAR_DIR);
      await Promise.all(
        existing.map((f) => FileSystem.deleteAsync(`${AVATAR_DIR}${f}`, { idempotent: true })),
      );
    } catch {}
  }

  const ext = sourceUri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const dest = `${AVATAR_DIR}avatar-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}
