import fs from 'node:fs/promises';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {createCanvas} from '@napi-rs/canvas';
import {createWorker} from 'tesseract.js';
const task=getDocument({data:new Uint8Array(await fs.readFile('C:/BOOKS/그리스도중심의설교.pdf')),useSystemFonts:true,verbosity:0});const pdf=await task.promise;
const worker=await createWorker(['eng','kor'],1,{langPath:'public/ocr/lang',cacheMethod:'none'});const results=[];
for(const n of [20,60,131,338]){const p=await pdf.getPage(n);const text=(await p.getTextContent()).items.map(x=>x.str||'').join('');console.log('Page',n,'text chars',text.length);for(const mode of [0,1]){const v=p.getViewport({scale:2.5});const canvas=createCanvas(Math.ceil(v.width),Math.ceil(v.height));await p.render({canvas,viewport:v,annotationMode:mode}).promise;const data=canvas.toBuffer('image/png');await fs.writeFile(`work/scan-test/page-${n}-${mode}.png`,data);const {data:ocr}=await worker.recognize(data);await fs.writeFile(`work/scan-test/page-${n}-${mode}.txt`,ocr.text);const row={page:n,annotations:mode,confidence:ocr.confidence,chars:ocr.text.length};results.push(row);console.log(JSON.stringify(row));}p.cleanup();}
await fs.writeFile('work/scan-test/results.json',JSON.stringify(results,null,2));await worker.terminate();await task.destroy();
