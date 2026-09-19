import fs from 'node:fs/promises';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {createCanvas} from '@napi-rs/canvas';
const task=getDocument({data:new Uint8Array(await fs.readFile('C:/BOOKS/그리스도중심의설교.pdf')),useSystemFonts:true});const pdf=await task.promise;
console.log('Pages:',pdf.numPages);
await fs.mkdir('work/scan-test',{recursive:true});
const summary=[];
for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const annotations=await p.getAnnotations();if(annotations.length)summary.push({page:i,types:annotations.map(a=>a.subtype)});p.cleanup();}
console.log('Annotations:',JSON.stringify(summary.slice(0,25)));await fs.writeFile('work/scan-test/annotations.json',JSON.stringify(summary));
const selected=[1,5,10,20,40,80,120,160,200,240,280,320].filter(n=>n<=pdf.numPages);
const sheet=createCanvas(900,Math.ceil(selected.length/3)*390);const ctx=sheet.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,sheet.width,sheet.height);
for(let j=0;j<selected.length;j++){const p=await pdf.getPage(selected[j]);const v=p.getViewport({scale:1});const scaled=p.getViewport({scale:Math.min(285/v.width,355/v.height)});const c=createCanvas(Math.ceil(scaled.width),Math.ceil(scaled.height));await p.render({canvas:c,viewport:scaled}).promise;const x=(j%3)*300,y=Math.floor(j/3)*390;ctx.drawImage(c,x,y+25);ctx.fillStyle='black';ctx.font='18px sans-serif';ctx.fillText('PDF '+selected[j],x+10,y+20);p.cleanup();}
await fs.writeFile('work/scan-test/contact.png',sheet.toBuffer('image/png'));await task.destroy();
