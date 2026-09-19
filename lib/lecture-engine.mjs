// Deterministic preparation: no summarizing or removal of parenthetical content.
export function koreanNumber(value){const n=Number(value);if(!n)return '영';const digits='영일이삼사오육칠팔구';return String(n).split('').map((d,i,a)=>{const power=a.length-i-1;return d==='0'?'':(d==='1'&&power?'':digits[Number(d)])+(['','십','백','천'][power]||'');}).join('');}
export function normalizeTts(raw) {
 return raw.replace(/\u0000/g,' ').replace(/\r\n?/g,'\n').replace(/[\t ]+/g,' ').replace(/([.!?,])(?=[가-힣])/g,'$1 ')
 .replace(/(?<![\w가-힣])(?:(시편|창세기|출애굽기|이사야|빌립보서|창|출|사|대상|빌)\s*)?(\d{1,3}):([0-9]{1,3})(?:\s*[-~–\u00ad]\s*(?:(\d{1,3}):)?(\d{1,3}))?/g,(_,book,ch,v,endCh,end)=>{const b={창:'창세기',출:'출애굽기',사:'이사야',대상:'역대상',빌:'빌립보서'}[book]||book;return `${b?b+' ':''}${koreanNumber(ch)}${book==='시편'?'편':'장'} ${koreanNumber(v)}절${end?`부터 ${endCh?koreanNumber(endCh)+'장 ':''}${koreanNumber(end)}절`:''}`;})
 .replace(/(\d{1,3})(장|편)\s*(\d{1,3})절(?:\s*(?:에서|부터)\s*(?:(\d{1,3})장\s*)?(\d{1,3})절)?/g,(_,ch,unit,v,endCh,end)=>`${koreanNumber(ch)}${unit} ${koreanNumber(v)}절${end?`부터 ${endCh?koreanNumber(endCh)+'장 ':''}${koreanNumber(end)}절`:''}`)
 .replace(/(\d{1,3})\s*(?:장|편)?\s*[-~–]\s*(\d{1,3})\s*(장|편)/g,(_,start,end,unit)=>`${koreanNumber(start)}${unit}부터 ${koreanNumber(end)}${unit}`)
 .replace(/(\d{1,3})\s*,\s*(\d{1,3})\s*(장|편)/g,(_,first,second,unit)=>`${koreanNumber(first)}${unit}, ${koreanNumber(second)}${unit}`)
 .replace(/(?<!\d)(제\s*)?(\d{1,3})\s*(장|편)/g,(_,je,num,unit)=>`${je?je:''}${koreanNumber(num)}${unit}`)
 .replace(/\n{3,}/g,'\n\n').trim();
}
export function chapterHeading(text){const t=text.trim();if(t.length>110||/\.{3}|…|이루어져|구성되어/.test(t))return null;const m=t.match(/^제\s*(\d{1,3})\s*[강장]\s*[.:：-]?\s+(.+)$/)||t.match(/^(?:chapter|lesson|lecture)\s+(\d{1,3})\s*[.:：-]?\s+(.+)$/i);return m?{number:Number(m[1]),title:t}:null;}
export function splitLectures(pages,manual=''){
 if(!pages.length)throw new Error('먼저 PDF를 불러오세요.');let full='';const starts=[];pages.forEach((p,i)=>{if(i){const previous=pages[i-1];const continuing=p.startsWithContinuation&&!/[.!?。][”’"')]*$/.test(previous.text.trim());full+=continuing?(previous.endsWithSpace?' ':(/[A-Za-z0-9]$/.test(previous.text)&&/^[A-Za-z0-9]/.test(p.text)?' ':'')):'\n\n';}starts.push(full.length);full+=p.text;});const detected=[];let last=0;
 const candidates=[];
 pages.forEach((p,pi)=>{let local=0;for(const line of p.text.split('\n')){const h=chapterHeading(line);if(h)candidates.push({...h,page:pi+1,offset:starts[pi]+local});local+=line.length+1;}});
 // A contents entry often ends in a page number and repeats as a body heading.
 const bodyCandidates=candidates.filter((c,i)=>!candidates.slice(i+1).some(next=>next.number===c.number&&c.title.replace(/\s+\d+\s*$/,'')===next.title&&c.title!==next.title));
 // Compare complete numbering sequences instead of accepting the first occurrence.
 const sequences=[];let sequence=[];
 for(const c of bodyCandidates){if(sequence.length&&c.number<sequence.at(-1).number){sequences.push(sequence);sequence=[];}if(!sequence.length||c.number>sequence.at(-1).number)sequence.push(c);}
 if(sequence.length)sequences.push(sequence);
 sequences.sort((a,b)=>b.length-a.length||(b.at(-1).page-b[0].page)-(a.at(-1).page-a[0].page));
 const best=sequences[0]||[];
 // A cluster of headings alone is insufficient evidence of body boundaries.
 if(best.length<3||best.at(-1).page-best[0].page>=best.length-1)detected.push(...best);
 let cuts=detected;if(manual.trim()){const tokens=manual.split(/[,\s]+/).filter(Boolean);if(tokens.some(x=>!/^\d+$/.test(x)))throw new Error('시작 쪽은 쉼표로 구분한 정수로 입력하세요.');const numbers=tokens.map(Number);if(numbers.some((x,i)=>x<1||x>pages.length||(i>0&&x<=numbers[i-1])))throw new Error('시작 쪽을 PDF 범위 안에서 중복 없이 오름차순으로 입력하세요.');cuts=numbers.map((p,i)=>({page:p,offset:starts[p-1],title:detected.find(d=>d.page===p)?.title||`제${i+1}강`,number:i+1}));}
 if(!cuts.length)cuts=[{page:1,offset:0,title:'전체 문서',number:1}];if(cuts[0].offset>0){const front=[];const limit=cuts[0].offset;pages.forEach((p,pi)=>{let local=0;for(const line of p.text.split('\n')){const offset=starts[pi]+local;const title=line.trim();if(offset<limit&&/^(?:목\s*차|차례|저자(?:의)?\s*서문|서문|머리말|들어가면서|역자(?:의)?\s*서문|편집자(?:의)?\s*서문|preface|foreword|contents)$/i.test(title))front.push({page:pi+1,offset,title,number:0});local+=line.length+1;}});if(!front.length||front[0].offset>0)front.unshift({page:1,offset:0,title:'표지·발행 정보',number:0});cuts=[...front,...cuts];}
 const lectures=cuts.map((c,i)=>{const raw=full.slice(c.offset,cuts[i+1]?.offset??full.length).trim();return{id:`lecture-${i+1}`,title:c.title,startPage:i===0?1:c.page,endPage:cuts[i+1]?Math.max(c.page,cuts[i+1].page-(cuts[i+1].offset===starts[cuts[i+1].page-1]?1:0)):pages.length,raw,text:reflowTtsParagraphs(normalizeTts(raw))};});
 if(lectures.map(l=>l.raw.replace(/\s/g,'')).join('')!==full.replace(/\s/g,''))throw new Error('분할 결과에 원문 누락이 발견되었습니다.');return{lectures,detected,sourceCharacters:full.length,hasAutomaticHeadings:detected.length>0};
}
export function splitBilingual(text,max=700){
 const runs=[];let lang='ko',pending='';const tokens=text.match(/[A-Za-z]+(?:[’'\-][A-Za-z]+)*|[가-힣ㄱ-ㅎㅏ-ㅣ]+|[^A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ]+/g)||[];
 for(const token of tokens){const next=/^[A-Za-z]/.test(token)?'en':/^[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(token)?'ko':null;if(next&&next!==lang&&pending){runs.push({lang,text:pending});pending='';}if(next)lang=next;pending+=token;}if(pending)runs.push({lang,text:pending});const out=[];
 for(const run of runs){let rest=run.text;while(rest.length>max){let cut=rest.lastIndexOf(' ',max);if(cut<max*.5)cut=max;else cut++;if(/[\uD800-\uDBFF]/.test(rest[cut-1]||''))cut--;out.push({lang:run.lang,text:rest.slice(0,cut)});rest=rest.slice(cut);}if(rest)out.push({lang:run.lang,text:rest});}return out;
}
export function safeName(value){return value.replace(/[\\/:*?"<>|\x00-\x1F]/g,'').trim().slice(0,90)||'강의';}
export function paragraphFilename(index, text){
 const clean = (text || '')
  .replace(/^(?:(?:\d+|[IVX]+)[.)]\s*|[•●▪\-–—]\s*|\([0-9가-힣a-zA-Z]+\)\s*)/, '')
  .replace(/[\r\n\t]+/g, ' ')
  .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
  .trim();
 const words = clean
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 3)
  .map(w => safeName(w).slice(0, 25))
  .filter(Boolean);
 const prefix = String(index).padStart(3, '0');
 return words.length ? `${prefix}_${words.join('_')}.mp3` : `${prefix}.mp3`;
}
export function lectureFolderName(title){
 const clean = (title || '강의')
  .replace(/\([^)]*\)|（[^）]*）/g, '')
  .replace(/제\s*(\d+)\s*강/g, '제$1장')
  .replace(/[\\/:*?"<>|\x00-\x1F]/g, '')
  .replace(/\s+/g, '')
  .trim()
  .slice(0, 60);
 return (clean || '강의') + '_단락별';
}
export function escapeXml(s){return s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
export function makeSsml(text,ko,en){return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">${splitBilingual(text).map(p=>`<voice name="${escapeXml(p.lang==='en'?en:ko)}"><lang xml:lang="${p.lang==='en'?'en-US':'ko-KR'}">${escapeXml(p.text)}</lang></voice>`).join('')}</speak>`;}

// The editable manuscript's newline boundaries define navigation paragraphs.
export function splitParagraphs(text){
 return (text.match(/[^\r\n]+(?:\r?\n|$)/g)||[]).filter(t=>t.trim()).map(text=>({text,parts:splitBilingual(text,700)}));
}
export async function paragraphAudio(paragraph,synthesize){
 const blobs=[];
 for(const part of paragraph.parts)blobs.push(await synthesize(part));
 return new Blob(blobs,{type:'audio/mpeg'});
}

export function reflowTtsParagraphs(text){
 const original=text.replace(/\r\n?/g,'\n');const repaired=original.replace(/부지런하\s+고/g,'부지런하고').replace(/한\s*\n\s*다(?=[.!?。\s]|$)/g,'한다').replace(/진\s*\n\s*리/g,'진리').replace(/세계관[ \t]+(?=\(worldview\))/g,'세계관');const lines=repaired.split('\n');const out=[];let current='';
 const heading=t=>/^(?:제\s*(?:\d+|[일이삼사오육칠팔구십백]+)\s*[강장]|[IVX]+[.)]\s|\d+[.)]\s|[가-힣][.)]\s|[•●▪]\s|목차$)/.test(t)|| (t.length<36&&!/[.!?。,:;]$/.test(t)&&!/(?:은|는|이|가|을|를|의|와|과|에|에서|으로|고|며|지만|그러나|때문에|있는|없는|하는|대한|통한)$/.test(t));
 const ended=t=>/[.!?。][”’"')\]]*$/.test(t);
 for(const raw of lines){const t=raw.trim();if(!t)continue;if(!current){current=t;continue;}
  if(!heading(current)&&!heading(t)&&!ended(current))current+=' '+t;
  else{out.push(current);current=t;}
 }
 if(current)out.push(current);const result=out.join('\n\n');
 if(result.replace(/\s/g,'')!==original.replace(/\s/g,''))throw new Error('문단 정리 중 원문 변경을 감지했습니다.');return result;
}

export function repairLectureManuscripts(lectures){
 const vocabulary=new Set(lectures.flatMap(l=>(l.raw+' '+l.text).match(/[가-힣]{2,}/g)||[]));
 return lectures.map(l=>{
  // Rejoin only word forms evidenced elsewhere in this book, or a detached grammatical ending.
  let text=l.text.replace(/([가-힣]+)([ \t]*\n\s*)([가-힣]+)/g,(all,left,space,right)=>{
   const joined=left+right;
   return vocabulary.has(joined)||/^(?:으로|으로는|으로써|으로서|에서는|에게는|한다|하는|하며|지만|니다|다)$/.test(right)?joined:all;
  });
  text=reflowTtsParagraphs(text);
  // Editorial notes have both an explicit numbered entry and an editor attribution.
  text=text.replace(/(^|\n+)(\d{1,3})[.)]\s+([^]*?[-–—]\s*편집자[.]?)(?=\n|$)/g,(all,lead,n,body)=>{
   if(!text.slice(0,text.indexOf(all)).trim().endsWith(n+')'))return all;
   return `${lead}편집자 주 ${koreanNumber(n)}. ${body.replace(/\s*\n\s*/g,' ')} 편집자 주 끝.`;
  });
  text=text.replace(/\d{1,3}\)(?=\n+편집자 주 [일이삼사오육칠팔구십백]+)/g,'');
  return {...l,text};
 });
}

export function speechText(text,readParentheticalEnglish=true,omitAllEnglish=false){
 text=normalizeTts(text);
 if(omitAllEnglish)return text.replace(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g,'').replace(/\([ \t]*\)|（[ \t]*）/g,'');
 if(readParentheticalEnglish)return text;
 return text.replace(/\([^()]*\)|（[^（）]*）/g,part=>/[A-Za-z]/.test(part)&&!/[가-힣ㄱ-ㅎㅏ-ㅣ\p{Script=Han}]/u.test(part)?'':part);
}
