import {test} from 'node:test';
import assert from 'node:assert/strict';
import {splitLectures,normalizeTts,splitBilingual,makeSsml} from '../lib/lecture-engine.mjs';
test('preface and both lectures retained once; repeated titles not split',()=>{const pages=[{text:'서문입니다.'},{text:'제1강 시작\n첫 본문 (English term).'}, {text:'제1강 시작\n이어서.'},{text:'제2강 다음\n둘째 본문.'}];const r=splitLectures(pages);assert.equal(r.lectures.length,3);assert.equal(r.lectures.map(l=>l.raw.replace(/\s/g,'')).join(''),pages.map(p=>p.text.replace(/\s/g,'')).join(''));assert.ok(r.lectures[1].text.includes('English term'));});
test('invalid page ranges rejected, manual starts preserve preface',()=>{const pages=[{text:'서문'},{text:'가'},{text:'나'}];for(const value of ['2,2','3,2','0,2','2,4','2,x','2.5'])assert.throws(()=>splitLectures(pages,value));const r=splitLectures(pages,'2,3');assert.equal(r.lectures[0].raw,'서문');assert.equal(r.lectures[1].raw,'가');});
test('Korean, English and punctuation round-trip without omission',()=>{const t='하나님의 행위(Acts of God)를 살핍니다. John 3:16. '+'긴문장😀'.repeat(300);const p=splitBilingual(t,70);assert.equal(p.map(p=>p.text).join(''),t);assert.ok(p.some(p=>p.lang==='en'&&p.text.includes('Acts of God')));assert.ok(p.every(p=>p.text.length<=70));assert.ok(p.every(p=>!/[\uD800-\uDBFF]$/.test(p.text)));});
test('readable Bible references preserve English and parenthetical content',()=>{assert.equal(normalizeTts('창 1:1-2 (Creation)\n시편 72:11'),'창세기 일장 일절부터 이절 (Creation)\n시편 칠십이편 십일절');assert.match(normalizeTts('출애굽기 1:1-19:1'),/일장 일절부터 십구장 일절/);});
test('SSML escapes source content',()=>{const s=makeSsml('하나님 < Acts & God >','ko-KR-SunHiNeural','en-US-EmmaMultilingualNeural');assert.ok(s.includes('&lt;'));assert.ok(s.includes('&amp;'));assert.ok(s.includes('xml:lang="en-US"'));});

test('contents entries do not override actual body lecture boundaries',()=>{
 const pages=Array.from({length:239},()=>({text:'본문 내용입니다.'}));
 const starts=[11,34,52,71,90,110,131,150,172,194,217];
 pages[3].text=starts.map((p,i)=>`제${i+1}강 제목 ${p}`).join('\n');
 starts.forEach((p,i)=>{pages[p-1].text=`제${i+1}강 제목\n실제 강의 본문입니다.`;});
 const r=splitLectures(pages);
 assert.deepEqual(r.detected.map(x=>x.page),starts);
 assert.equal(r.lectures.at(-1).startPage,217);
 assert.equal(r.lectures.at(-1).endPage,239);
});
test('contents without page numbers yield to the complete body sequence',()=>{
 const pages=Array.from({length:30},()=>({text:'본문입니다.'}));
 pages[0].text='제1강 하나\n제2강 둘\n제3강 셋';
 [4,14,24].forEach((p,i)=>{pages[p-1].text=`제${i+1}강 제목\n본문입니다.`;});
 assert.deepEqual(splitLectures(pages).detected.map(x=>x.page),[4,14,24]);
});

test('paragraph navigation keeps bilingual runs and long text inside one paragraph',async()=>{
 const {splitParagraphs,paragraphAudio}=await import('../lib/lecture-engine.mjs');
 const text='첫 단락 English words 그리고 한국어.\n\n'+'긴 내용입니다. '.repeat(180)+'\n마지막 단락.';
 const paragraphs=splitParagraphs(text);
 assert.equal(paragraphs.length,3);
 assert.equal(paragraphs.map(p=>p.text).join('').replace(/\s/g,''),text.replace(/\s/g,''));
 assert.ok(paragraphs[1].parts.length>1);
 const seen=[];
 const audio=await paragraphAudio(paragraphs[0],async part=>{seen.push(part.lang);return new Blob([part.text]);});
 assert.deepEqual(seen,['ko','en','ko']);
 assert.equal(await audio.text(),paragraphs[0].text);
 let calls=0;
 await assert.rejects(()=>paragraphAudio(paragraphs[0],async()=>{calls++;throw new Error('failed');}),/failed/);
 assert.equal(calls,1);
});

 test('verse ranges have explicit Korean pronunciation, including saved manuscripts',()=>{assert.equal(normalizeTts('1:20-21'),'일장 이십절부터 이십일절');assert.equal(normalizeTts('1장 20절에서 21절'),'일장 이십절부터 이십일절');assert.equal(normalizeTts(normalizeTts('1:20-21')),'일장 이십절부터 이십일절');});

test('playback ignores replaced requests but reports genuine playback failures',async()=>{
 const {startPlayback,cancelPlayback}=await import('../lib/playback.mjs');const errors=[];let reject;
 const player={src:'first',play:()=>new Promise((_,r)=>{reject=r;}),pause(){}};
 const old=startPlayback(player,e=>errors.push(e));cancelPlayback(player);player.src='second';reject(new DOMException('interrupted','AbortError'));await old;assert.equal(errors.length,0);
 player.play=()=>Promise.reject(new Error('decode failure'));await startPlayback(player,e=>errors.push(e));assert.equal(errors.length,1);
});

test('reported PDF split words and paragraph breaks are repaired without changing content',async()=>{
 const {reflowTtsParagraphs}=await import('../lib/lecture-engine.mjs');
 const raw='그러므로 우리는 항상 부지런하 고 신중해야 한다. 또한 하나님의 말씀을 깊이 존중하는 마음으로 대해야 한\n\n다. 그리고 성령의 영감과 조명하심을 힘입어, 최선을 다해 하나님 말씀의 진\n\n리에 충실해야 한다. 무엇보다도 자신의 선이해(presuppositions)나 세계관 (worldview)을 성경 본문에 억지로 투영하지 않도록 주의해야 한다.';
 const result=reflowTtsParagraphs(raw);
 assert.equal(result,'그러므로 우리는 항상 부지런하고 신중해야 한다. 또한 하나님의 말씀을 깊이 존중하는 마음으로 대해야 한다. 그리고 성령의 영감과 조명하심을 힘입어, 최선을 다해 하나님 말씀의 진리에 충실해야 한다. 무엇보다도 자신의 선이해(presuppositions)나 세계관(worldview)을 성경 본문에 억지로 투영하지 않도록 주의해야 한다.');
 assert.equal(result.replace(/\s/g,''),raw.replace(/\s/g,''));
});

test('contents and preface are separate from lectures with complete coverage',()=>{
 const pages=[{text:'표지'},{text:'차례\n제1강 시작 4'},{text:'저자 서문\n서문 내용.'},{text:'제1강 시작\n강의 내용.'}];
 const r=splitLectures(pages);assert.deepEqual(r.lectures.map(l=>l.title),['표지·발행 정보','차례','저자 서문','제1강 시작']);assert.equal(r.lectures.at(-1).startPage,4);assert.equal(r.lectures.map(l=>l.raw.replace(/\s/g,'')).join(''),pages.map(p=>p.text.replace(/\s/g,'')).join(''));
});

test('English parentheses are optional for speech without removing Korean explanations',async()=>{
 const {speechText}=await import('../lib/lecture-engine.mjs');const t='선이해(presuppositions), 세계관（worldview） (설명 English) John 3:16';
 assert.equal(speechText(t),normalizeTts(t));assert.equal(speechText(t,false),'선이해, 세계관 (설명 English) John 삼장 십육절');
});

test('all-English omission includes inline glosses outside parentheses',async()=>{const {speechText}=await import('../lib/lecture-engine.mjs');const text='세계관 worldview과 선이해(presuppositions)를 읽습니다.';assert.equal(speechText(text,true,true),'세계관 과 선이해를 읽습니다.');assert.equal(speechText(text,true),text);});

test('speech always pronounces edited Arabic chapter and verse numbers as Sino-Korean',async()=>{const {speechText}=await import('../lib/lecture-engine.mjs');assert.equal(speechText('창세기2:3'),'창세기 이장 삼절');assert.equal(speechText('창세기 2장 3절 (Genesis)',false),'창세기 이장 삼절 ');assert.equal(speechText('1:20-21'),'일장 이십절부터 이십일절');});

test('Philippians abbreviation expands with Sino-Korean chapter and verse',async()=>{const {speechText}=await import('../lib/lecture-engine.mjs');assert.equal(speechText('빌2:7'),'빌립보서 이장 칠절');assert.equal(speechText('빌 2:7-8'),'빌립보서 이장 칠절부터 팔절');assert.equal(speechText('빌립보서2:7'),'빌립보서 이장 칠절');});

test('chapter and psalm numbers are pronounced in Sino-Korean (e.g. 11장 -> 십일장)',async()=>{
 const {speechText,normalizeTts}=await import('../lib/lecture-engine.mjs');
 assert.equal(normalizeTts('11장'),'십일장');
 assert.equal(normalizeTts('창세기 11장'),'창세기 십일장');
 assert.equal(normalizeTts('11장과 12장'),'십일장과 십이장');
 assert.equal(normalizeTts('1-11장'),'일장부터 십일장');
 assert.equal(normalizeTts('1장-11장'),'일장부터 십일장');
 assert.equal(normalizeTts('11장의'),'십일장의');
 assert.equal(normalizeTts('11장에서'),'십일장에서');
 assert.equal(normalizeTts('제11장'),'제십일장');
 assert.equal(speechText('11장'),'십일장');
 assert.equal(speechText('시편 11편'),'시편 십일편');
});

test('paragraphFilename formats index and first 3 words (e.g. 023_본질적으로_성경을_연구.mp3)',async()=>{
 const {paragraphFilename}=await import('../lib/lecture-engine.mjs');
 assert.equal(paragraphFilename(23, '본질적으로 성경을 연구하는 데 있어서'), '023_본질적으로_성경을_연구하는.mp3');
 assert.equal(paragraphFilename(23, '본질적으로 성경을 연구'), '023_본질적으로_성경을_연구.mp3');
 assert.equal(paragraphFilename(1, '1. 본질적으로 성경을 연구'), '001_본질적으로_성경을_연구.mp3');
 assert.equal(paragraphFilename(5, '“하나님의 행위(Acts of God)”를 살핍니다.'), '005_하나님의_행위_Acts.mp3');
 assert.equal(paragraphFilename(10, ''), '010.mp3');
});

test('lectureFolderName formats folder as title_단락별 (e.g. 제1장성경해석학서론_단락별)',async()=>{
 const {lectureFolderName}=await import('../lib/lecture-engine.mjs');
 assert.equal(lectureFolderName('제1강 성경해석학 서론(Introduction to Biblical Hermeneutics)'), '제1장성경해석학서론_단락별');
 assert.equal(lectureFolderName('제1강 성경해석학 서론'), '제1장성경해석학서론_단락별');
 assert.equal(lectureFolderName('제2강 해석을 위한 준비'), '제2장해석을위한준비_단락별');
 assert.equal(lectureFolderName('표지·발행 정보'), '표지·발행정보_단락별');
});

test('Bible abbreviations expand to full Korean book names with Sino-Korean chapter/verse',async()=>{
 const {speechText}=await import('../lib/lecture-engine.mjs');
 assert.equal(speechText('고후 5:18-19'),'고린도후서 오장 십팔절부터 십구절');
 assert.equal(speechText('롬 8:29'),'로마서 팔장 이십구절');
 assert.equal(speechText('창 1:1-2'),'창세기 일장 일절부터 이절');
 assert.equal(speechText('시 23:1-3'),'시편 이십삼편 일절부터 삼절');
 assert.equal(speechText('출 3:14'),'출애굽기 삼장 십사절');
 assert.equal(speechText('요일 5:6-7'),'요한일서 오장 육절부터 칠절');
 assert.equal(speechText('(고후 5:18-19)'),'(고린도후서 오장 십팔절부터 십구절)');
});

test('Hanja and footnote marks are removed from speechText',async()=>{
 const {speechText}=await import('../lib/lecture-engine.mjs');
 const sample = `성령께서는 마치 인(印)을 치듯이 증거를 마음에 새기신다.
신학자들3)에게서 비롯된 것인데, 끝없는 미로(迷路)를 헤매게 될 것이다.
그것이 다. 2)
1. 참조. 1권 13장 14-15절.
2. 그리스도와 성령`;
 const result = speechText(sample);
 assert.ok(!result.includes('印'));
 assert.ok(!result.includes('迷路'));
 assert.ok(!result.includes('3)'));
 assert.ok(!result.includes('2)'));
 assert.ok(!result.includes('참조.'));
 assert.ok(result.includes('인을 치듯이'));
 assert.ok(result.includes('신학자들에게서'));
 assert.ok(result.includes('미로를'));
 assert.ok(result.includes('이. 그리스도와 성령'));
});

test('All numbers are pronounced as Sino-Korean (일, 이, 삼...)',async()=>{
 const {speechText}=await import('../lib/lecture-engine.mjs');
 assert.equal(speechText('3가지 이유가 있다.'),'삼가지 이유가 있다.');
 assert.equal(speechText('100명의 사람'),'백명의 사람');
 assert.equal(speechText('1536년 출간'),'천오백삼십육년 출간');
 assert.equal(speechText('1. 성령의 역사'),'일. 성령의 역사');
});

test('Parenthesis options control reading mode',async()=>{
 const {speechText}=await import('../lib/lecture-engine.mjs');
 const text = '선이해(presuppositions)와 (고후 5:18-19) 구절 및 (보충 설명)입니다.';
 assert.equal(speechText(text, 'omit_english_hanja'), '선이해와 (고린도후서 오장 십팔절부터 십구절) 구절 및 (보충 설명)입니다.');
 assert.equal(speechText(text, 'omit_all'), '선이해와 구절 및 입니다.');
 assert.equal(speechText(text, 'bible_only'), '선이해와 (고린도후서 오장 십팔절부터 십구절) 구절 및 입니다.');
 assert.equal(speechText(text, 'read_all'), '선이해(presuppositions)와 (고린도후서 오장 십팔절부터 십구절) 구절 및 (보충 설명)입니다.');
});

test('standalone chapter headings on their own line pick up title from next line',async()=>{
 const {splitLectures}=await import('../lib/lecture-engine.mjs');
 const pages = [
   { text: '서문입니다.' },
   { text: '제1장\n그리스도의 은혜는 성령의 역사로 베풀어짐\n1. 본문 내용입니다.' },
   { text: '제2장\n믿음의 정의와 특성\n본문 내용입니다.' }
 ];
 const r = splitLectures(pages);
 assert.equal(r.detected.length, 2);
 assert.equal(r.detected[0].title, '제1장 그리스도의 은혜는 성령의 역사로 베풀어짐');
 assert.equal(r.detected[1].title, '제2장 믿음의 정의와 특성');
});
