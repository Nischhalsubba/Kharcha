import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function shareMonthlyPdf({ html, monthKey }) {
  const printed = await Print.printToFileAsync({ html });
  if (!printed?.uri) throw new Error('Kharcha could not generate the PDF file.');

  const source = new File(printed.uri);
  const filename = `kharcha-monthly-report-${monthKey}.pdf`;
  const target = new File(Paths.cache, filename);
  await source.copy(target, { overwrite: true });

  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('Sharing is not available on this device.');

  await Sharing.shareAsync(target.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Kharcha monthly report',
    UTI: 'com.adobe.pdf',
  });
  return { uri: target.uri, filename };
}
