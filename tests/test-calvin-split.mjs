import fs from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { reconstructPage } from '../lib/pdf-layout.mjs';
import { splitLectures } from '../lib/lecture-engine.mjs';

const pdfPath = 'C:/Users/steph/Downloads/기독교강요중.pdf';
const data = new Uint8Array(await fs.readFile(pdfPath));
const doc = await getDocument({ data }).promise;
console.log('Total pages:', doc.numPages);

const pages = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent({ disableNormalization: true });
  pages.push({ page: i, ...reconstructPage(content.items, page.getViewport({ scale: 1 }).height) });
}

const result = splitLectures(pages);
console.log('Detected lectures count:', result.lectures.length);
console.log('Detected sequence length:', result.detected.length);
result.detected.forEach(d => console.log(`Ch ${d.number} P.${d.page} ${d.title}`));
