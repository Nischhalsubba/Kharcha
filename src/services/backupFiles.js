import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

function compactTimestamp(iso) {
  return String(iso || new Date().toISOString()).replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', '-');
}

export async function shareBackupText(text, createdAt) {
  const filename = `kharcha-backup-${compactTimestamp(createdAt)}.kharcha.json`;
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true, intermediates: true });
  file.write(text);

  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('Sharing is not available on this device.');

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Back up Kharcha',
    UTI: 'public.json',
  });
  return { uri: file.uri, filename };
}

export async function pickBackupText() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('Kharcha could not read the selected file.');
  const file = new File(asset.uri);
  const size = asset.size ?? file.size ?? null;
  if (size != null && size > 25 * 1024 * 1024) throw new Error('This backup is larger than 25 MB and was not opened.');
  const text = await file.text();
  return {
    text,
    name: asset.name || file.name || 'Kharcha backup',
    size,
  };
}
