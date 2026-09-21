import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareCsvExport({ csv, filename }) {
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true, intermediates: true });
  file.write(csv);

  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('Sharing is not available on this device.');

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Kharcha transactions',
    UTI: 'public.comma-separated-values-text',
  });
  return { uri: file.uri, filename };
}
