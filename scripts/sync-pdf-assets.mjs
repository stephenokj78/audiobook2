import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('public',{recursive:true});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/pdf.worker.min.mjs');
for(const name of ['cmaps','standard_fonts'])await cp(`node_modules/pdfjs-dist/${name}`,`public/${name}`,{recursive:true});

await mkdir('public/ocr/lang',{recursive:true});
await copyFile('node_modules/tesseract.js/dist/worker.min.js','public/ocr/worker.min.js');
await cp('node_modules/tesseract.js-core','public/ocr/core',{recursive:true});
for(const lang of ['kor','eng'])await copyFile(`node_modules/@tesseract.js-data/${lang}/4.0.0/${lang}.traineddata.gz`,`public/ocr/lang/${lang}.traineddata.gz`);
