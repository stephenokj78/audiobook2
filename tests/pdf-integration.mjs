import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {reconstructPage} from '../lib/pdf-layout.mjs';
import {splitLectures,splitBilingual} from '../lib/lecture-engine.mjs';
const path=process.argv[2];if(!path)throw new Error('Pass the test PDF path.');
const loadingTask=getDocument({data:new Uint8Array(await fs.readFile(path)),cMapUrl:new URL('../node_modules/pdfjs-dist/cmaps/',import.meta.url).pathname,cMapPacked:true,useSystemFonts:true});const pdf=await loadingTask.promise;
const pages=[];for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i),c=await p.getTextContent({disableNormalization:true});pages.push({page:i,...reconstructPage(c.items,p.getViewport({scale:1}).height)});p.cleanup();}
const r=splitLectures(pages);assert.equal(pages.length,128);assert.equal(r.lectures.length,4);assert.deepEqual(r.detected.map(x=>x.page),[3,33,64,97]);assert.equal(pages.filter(p=>p.empty).length,0);assert.ok(r.lectures[3].text.includes('소망 가운데 그리스도를 위해 살 것인가'));
for(const l of r.lectures)assert.equal(splitBilingual(l.text).map(p=>p.text).join(''),l.text);
await fs.mkdir('work',{recursive:true});await fs.writeFile('work/integration-lectures.json',JSON.stringify(r.lectures));await fs.writeFile('work/pdf-pages.json',JSON.stringify(pages));
console.log(JSON.stringify({pages:pages.length,lectures:r.lectures.map(l=>({title:l.title,start:l.startPage,end:l.endPage,characters:l.text.length})),pageNumbersRemoved:pages.reduce((s,p)=>s+p.removedPageNumbers,0),contentCoverage:'all extracted non-whitespace characters retained'}));await loadingTask.destroy();

