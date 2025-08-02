import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import { info, error } from '../utils/logger.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${process.cwd()}/node_modules/pdfjs-dist/build/pdf.worker.mjs`;

async function downloadPDFAsBuffer(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      maxRedirects: 5,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return response.data;
  } catch (err) {
    error(
      'Axios error details:',
      err.response?.status,
      err.response?.statusText
    );
    throw err;
  }
}

async function handlePDFProcessing(pdfUrl) {
  info('Downloading PDF from URL: ', pdfUrl);
  let pdfBuffer;
  try {
    pdfBuffer = await downloadPDFAsBuffer(pdfUrl);
    info('PDF buffer size: ', pdfBuffer.length, 'bytes');
  } catch (err) {
    error('Error downloading PDF: ', err.message);
    throw new Error(`Could not download PDF: ${err.message}`);
  }
  info('PDF downloaded successfully');

  info('Extracting text content...');
  let extractedText = '';
  try {
    const pdfUint8Array = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array });
    const pdfDocument = await loadingTask.promise;

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += `${pageText}\n`;
    }

    info('PDF parsed successfully');
  } catch (err) {
    error('Error parsing PDF: ', err.message);
    error('Error details: ', err);
    throw new Error(`Could not parse PDF: ${err.message}`);
  }

  info('Extracted text content: ', extractedText.substring(0, 200));
  return extractedText;
}

export default handlePDFProcessing;
