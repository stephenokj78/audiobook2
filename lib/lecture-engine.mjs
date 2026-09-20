export function koreanNumber(value) {
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  if (isNaN(n) || n === 0) return '영';
  if (n < 0) return '마이너스 ' + koreanNumber(-n);

  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const smallUnits = ['', '십', '백', '천'];
  const bigUnits = ['', '만', '억', '조'];

  let result = '';
  let temp = n;
  let bigIdx = 0;

  while (temp > 0) {
    const chunk = temp % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      let c = chunk;
      for (let i = 0; i < 4; i++) {
        const d = c % 10;
        if (d > 0) {
          const digitWord = (d === 1 && i > 0) ? '' : digits[d];
          chunkStr = digitWord + smallUnits[i] + chunkStr;
        }
        c = Math.floor(c / 10);
      }
      result = chunkStr + (bigUnits[bigIdx] ? bigUnits[bigIdx] + ' ' : '') + result;
    }
    temp = Math.floor(temp / 10000);
    bigIdx++;
  }
  return result.trim();
}

export const BIBLE_MAP = {
  창: '창세기', 창세기: '창세기',
  출: '출애굽기', 출애굽기: '출애굽기',
  레: '레위기', 레위기: '레위기',
  민: '민수기', 민수기: '민수기',
  신: '신명기', 신명기: '신명기',
  수: '여호수아', 여호수아: '여호수아',
  삿: '사사기', 사사기: '사사기',
  룻: '룻기', 룻기: '룻기',
  삼상: '사무엘상', 사무엘상: '사무엘상',
  삼하: '사무엘하', 사무엘하: '사무엘하',
  왕상: '열왕기상', 열왕기상: '열왕기상',
  왕하: '열왕기하', 열왕기하: '열왕기하',
  대상: '역대상', 역대상: '역대상',
  대하: '역대하', 역대하: '역대하',
  스: '에스라', 에스라: '에스라',
  느: '느헤미야', 느헤미야: '느헤미야',
  에: '에스더', 에스더: '에스더',
  욥: '욥기', 욥기: '욥기',
  시: '시편', 시편: '시편',
  잠: '잠언', 잠언: '잠언',
  전: '전도서', 전도서: '전도서',
  아: '아가', 아가: '아가',
  사: '이사야', 이사야: '이사야',
  렘: '예레미야', 예레미야: '예레미야',
  애: '예레미야애가', 예레미야애가: '예레미야애가',
  겔: '에스겔', 에스겔: '에스겔',
  단: '다니엘', 다니엘: '다니엘',
  호: '호세아', 호세아: '호세아',
  욜: '요엘', 요엘: '요엘',
  암: '아모스', 아모스: '아모스',
  옵: '오바댜', 오바댜: '오바댜',
  욘: '요나', 요나: '요나',
  미: '미가', 미가: '미가',
  나: '나훔', 나훔: '나훔',
  합: '하박국', 하박국: '하박국',
  습: '스바냐', 습: '스바냐',
  학: '학개', 학개: '학개',
  슥: '스가랴', 스가랴: '스가랴',
  말: '말라기', 말라기: '말라기',
  마: '마태복음', 마태복음: '마태복음',
  막: '마가복음', 마가복음: '마가복음',
  눅: '누가복음', 누가복음: '누가복음',
  요: '요한복음', 요한복음: '요한복음',
  행: '사도행전', 사도행전: '사도행전',
  롬: '로마서', 로마서: '로마서',
  고전: '고린도전서', 고전: '고린도전서',
  고후: '고린도후서', 고후: '고린도후서', 고린도후서: '고린도후서',
  갈: '갈라디아서', 갈라디아서: '갈라디아서',
  엡: '에베소서', 에베소서: '에베소서',
  빌: '빌립보서', 빌립보서: '빌립보서',
  골: '골로새서', 골로새서: '골로새서',
  살전: '데살로니가전서', 데살로니가전서: '데살로니가전서',
  살후: '데살로니가후서', 데살로니가후서: '데살로니가후서',
  딤전: '디모데전서', 디모데전서: '디모데전서',
  딤후: '디모데후서', 디모데후서: '디모데후서',
  딛: '디도서', 디도서: '디도서',
  몬: '빌레몬서', 빌레몬서: '빌레몬서',
  히: '히브리서', 히브리서: '히브리서',
  약: '야고보서', 야고보서: '야고보서',
  벧전: '베드로전서', 베드로전서: '베드로전서',
  벧후: '베드로후서', 베드로후서: '베드로후서',
  요일: '요한일서', 요한일서: '요한일서',
  요이: '요한이서', 요이: '요한이서',
  요삼: '요한삼서', 요삼: '요한삼서',
  유: '유다서', 유다서: '유다서',
  계: '요한계시록', 요한계시록: '요한계시록'
};

const BIBLE_KEYS = Object.keys(BIBLE_MAP).sort((a,b)=>b.length-a.length).join('|');
const BIBLE_REGEX = new RegExp(`(?<![\\w가-힣])(?:(${BIBLE_KEYS})\\s*)?(\\d{1,3}):([0-9]{1,3})(?:\\s*[-~–\\u00ad]\\s*(?:(\\d{1,3}):)?(\\d{1,3}))?`, 'g');

export function normalizeTts(raw) {
 return raw.replace(/\u0000/g,' ').replace(/\r\n?/g,'\n').replace(/[\t ]+/g,' ').replace(/([.!?,])(?=[가-힣])/g,'$1 ')
 .replace(BIBLE_REGEX, (_, book, ch, v, endCh, end) => {
   const b = book ? (BIBLE_MAP[book] || book) : '';
   const unit = (b === '시편' || book === '시편' || book === '시') ? '편' : '장';
   const endUnit = unit;
   return `${b ? b + ' ' : ''}${koreanNumber(ch)}${unit} ${koreanNumber(v)}절${end ? `부터 ${endCh ? koreanNumber(endCh) + endUnit + ' ' : ''}${koreanNumber(end)}절` : ''}`;
 })
 .replace(/(\d{1,3})(장|편)\s*(\d{1,3})절(?:\s*(?:에서|부터)\s*(?:(\d{1,3})장\s*)?(\d{1,3})절)?/g,(_,ch,unit,v,endCh,end)=>`${koreanNumber(ch)}${unit} ${koreanNumber(v)}절${end?`부터 ${endCh?koreanNumber(endCh)+'장 ':''}${koreanNumber(end)}절`:''}`)
 .replace(/(\d{1,3})\s*(?:장|편)?\s*[-~–]\s*(\d{1,3})\s*(장|편)/g,(_,start,end,unit)=>`${koreanNumber(start)}${unit}부터 ${koreanNumber(end)}${unit}`)
 .replace(/(\d{1,3})\s*,\s*(\d{1,3})\s*(장|편)/g,(_,first,second,unit)=>`${koreanNumber(first)}${unit}, ${koreanNumber(second)}${unit}`)
 .replace(/(?<!\d)(제\s*)?(\d{1,3})\s*(장|편)/g,(_,je,num,unit)=>`${je?je:''}${koreanNumber(num)}${unit}`)
 .replace(/\n{3,}/g,'\n\n').trim();
}
export function chapterHeading(text){const t=text.trim();if(t.length>110||/\.{3}|…|이루어져|구성되어/.test(t))return null;const m=t.match(/^제\s*(\d{1,3})\s*([강장])(?:\s*[.:：-]?\s*(.*))?$/)||t.match(/^(?:chapter|lesson|lecture)\s+(\d{1,3})(?:\s*[.:：-]?\s*(.*))?$/i);return m?{number:Number(m[1]),title:t}:null;}
export function splitLectures(pages,manual=''){
 if(!pages.length)throw new Error('먼저 PDF를 불러오세요.');let full='';const starts=[];pages.forEach((p,i)=>{if(i){const previous=pages[i-1];const continuing=p.startsWithContinuation&&!/[.!?。][”’"')]*$/.test(previous.text.trim());full+=continuing?(previous.endsWithSpace?' ':(/[A-Za-z0-9]$/.test(previous.text)&&/^[A-Za-z0-9]/.test(p.text)?' ':'')):'\n\n';}starts.push(full.length);full+=p.text;});const detected=[];let last=0;
 const candidates=[];
 pages.forEach((p,pi)=>{
  let local=0;
  const lines=p.text.split('\n');
  for(let li=0;li<lines.length;li++){
   const line=lines[li];
   const h=chapterHeading(line);
   if(h){
    let title=h.title;
    if(/^제\s*\d{1,3}\s*[강장]$/i.test(title)||/^(?:chapter|lesson|lecture)\s+\d{1,3}$/i.test(title)){
     let nextLine=lines[li+1];
     if(!nextLine&&pages[pi+1]){nextLine=pages[pi+1].text.split('\n')[0];}
     if(nextLine){
      const nt=nextLine.trim();
      if(nt&&!/^\d+[.)]/.test(nt)&&!chapterHeading(nt)&&nt.length<90){title=title+' '+nt;}
     }
    }
    candidates.push({...h,title,page:pi+1,offset:starts[pi]+local});
   }
   local+=line.length+1;
  }
 });
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

const footnoteLineRegex = /^\s*\d{1,3}\.?\.?\s*(?:참조|불어판|라틴|원문|영어판|독일|이탈리아|Augustine|Calvin|Chrysostom|Bernard|Lombard|Luther|Plato|Aristotle|Cicero|Seneca|[A-Z][a-z]+|\d+권|[IVXLCDM]+\.)/i;
const continuationRegex = /^(?:[A-Za-z0-9IVXLCDMivxlcdm.,;: '\-\]\[\)\(]+|'[^']*'이란 의미이다\.)/i;

export function removeFootnoteLines(text) {
  const lines = text.split('\n');
  const out = [];
  let inFootnote = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (footnoteLineRegex.test(t)) {
      if (/[.;”’'\]\)]$/.test(t)) {
        inFootnote = false;
      } else {
        inFootnote = true;
      }
      continue;
    }
    if (inFootnote) {
      if (continuationRegex.test(t) && !/^\d+[.)]/.test(t) && !/^[가-힣]{2,}\s+[가-힣]/.test(t)) {
        if (/[.;”’'\]\)]$/.test(t)) inFootnote = false;
        continue;
      }
      inFootnote = false;
    }
    out.push(line);
  }
  return out.join('\n');
}

export function speechText(text, options = true) {
  let mode = 'read_all';
  if (typeof options === 'string') {
    mode = options;
  } else if (typeof options === 'boolean') {
    const readParentheticalEnglish = options;
    const omitAllEnglish = arguments[2] || false;
    if (omitAllEnglish) mode = 'omit_all_english';
    else if (!readParentheticalEnglish) mode = 'omit_english_hanja';
    else mode = 'read_all';
  }

  // 1. Remove entire footnote lines/paragraphs
  text = removeFootnoteLines(text);

  // 2. Normalize bible references & chapters BEFORE body footnote marks so references like (고후 5:18-19) are preserved
  text = normalizeTts(text);

  // 3. Remove inline footnote markers in body text on the same line
  // e.g. "신학자들3)", "것이 다. 2)", "다.2 ", "으므로, 1 "
  text = text.replace(/(?<=[\p{L}\p{N}.,!?])[ \t]*\d{1,2}\)/gu, '');
  text = text.replace(/(?<=[가-힣][.!?,”’])[ \t]*\d{1,2}(?=[^\d가-힣]|[ \t]+[가-힣]|$)/gu, '');

  // 4. Hanja removal (always remove pure Hanja or parenthesized Hanja for audio)
  text = text.replace(/\([가-힣\s]*[\u4E00-\u9FFF]+[^)]*\)|（[가-힣\s]*[\u4E00-\u9FFF]+[^）]*）/g, '');
  text = text.replace(/[\u4E00-\u9FFF]+/g, '');

  // 5. Parenthesis handling according to selected mode
  if (mode === 'omit_all_english') {
    text = text.replace(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g, '');
    text = text.replace(/\([ \t]*\)|（[ \t]*）/g, '');
  } else if (mode === 'omit_all') {
    text = text.replace(/\([^()]*\)|（[^（）]*）/g, '');
  } else if (mode === 'bible_only') {
    text = text.replace(/\(([^()]*)\)|（([^（）]*)）/g, (match, p1, p2) => {
      const content = p1 || p2 || '';
      if (/(?:장|편)\s*.*절/.test(content)) return match;
      return '';
    });
  } else if (mode === 'omit_english_hanja') {
    text = text.replace(/\([^()]*\)|（[^（）]*）/g, part => {
      if (/[A-Za-z]/.test(part) && !/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(part)) return '';
      return part;
    });
  }
  // 'read_all' keeps remaining parenthetical text

  // Clean empty parentheses
  text = text.replace(/\(\s*\)|（\s*）/g, '');

  // 6. Convert all remaining numbers to Sino-Korean (일, 이, 삼...)
  text = text.replace(/(?<![A-Za-z0-9])\d+(?![A-Za-z0-9])/g, m => koreanNumber(m));

  // Clean extra spaces within lines
  text = text.replace(/[ \t]{2,}/g, ' ');

  return text;
}

