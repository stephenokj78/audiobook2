import { reconstructPage } from './pdf-layout.mjs';
import {readSaved,writeSaved} from './audio-cache';
export type PageText={page:number;text:string;removedPageNumbers:number;empty:boolean;ocr?:boolean;confidence?:number};
export async function readPdf(file:File,onProgress:(n:number,total:number,stage?:string)=>void,forceOcr=false):Promise<PageText[]>{
 const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';const url=URL.createObjectURL(file);
 const loadingTask=pdfjs.getDocument({url,cMapUrl:'/cmaps/',cMapPacked:true,standardFontDataUrl:'/standard_fonts/'});
 let worker:import('tesseract.js').Worker|undefined;let currentPage=0,total=0;
 try{const pdf=await loadingTask.promise;total=pdf.numPages;const pages:PageText[]=[];
 for(let i=1;i<=total;i++){currentPage=i;const page=await pdf.getPage(i),viewport=page.getViewport({scale:1}),content=await page.getTextContent({disableNormalization:true});let result:PageText={page:i,...reconstructPage(content.items,viewport.height)};
 if(forceOcr||result.text.replace(/[^\p{L}\p{N}]/gu,'').length<40){
  const key=`ocr-v2:${pdf.fingerprints[0]}:${file.size}:${i}`;const saved=await readSaved<PageText>(key);
  if(saved)result=saved;
  else{
   onProgress(i-1,total,`스캔 문자 인식 준비 · ${i}/${total}쪽`);
   if(!worker){const {createWorker}=await import('tesseract.js');worker=await createWorker(['eng','kor'],1,{workerPath:'/ocr/worker.min.js',corePath:'/ocr/core',langPath:'/ocr/lang',logger:m=>{if(m.status==='recognizing text')onProgress(currentPage-1,total,`스캔 문자 인식 · ${currentPage}/${total}쪽 · ${Math.round(m.progress*100)}%`);}});}
   const scale=Math.min(2.5,Math.sqrt(8000000/(viewport.width*viewport.height))),v=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
   try{await page.render({canvas,viewport:v,annotationMode:pdfjs.AnnotationMode.DISABLE}).promise;const {data}=await worker.recognize(canvas);result={page:i,text:data.text.trim(),removedPageNumbers:0,empty:!data.text.trim(),ocr:true,confidence:data.confidence};await writeSaved(key,result);}finally{canvas.width=0;canvas.height=0;}
  }
 }
 pages.push(result);onProgress(i,total,result.ocr?`스캔 문자 인식 완료 · ${i}/${total}쪽`:`PDF 읽는 중 · ${i}/${total}쪽`);page.cleanup();}
 return pages;
 }finally{await worker?.terminate();await loadingTask.destroy();URL.revokeObjectURL(url);}
}
