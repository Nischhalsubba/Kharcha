import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

export async function pickCsvImportText() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('Kharcha could not read the selected CSV file.');
  const file = new File(asset.uri);
  const size = asset.size ?? file.size ?? null;
  if (size != null && size > 25 * 1024 * 1024) throw new Error('This CSV is larger than 25 MB and was not opened.');
  return { text: await file.text(), name: asset.name || file.name || 'Kharcha CSV', size };
}
