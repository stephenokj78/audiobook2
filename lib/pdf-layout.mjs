export function reconstructPage(items,pageHeight){
 const lines=[];
 for(const item of items){if(!('str' in item)||!item.str)continue;const x=item.transform[4],y=pageHeight-item.transform[5],height=Math.abs(item.height)||11;let line=lines.find(l=>Math.abs(l.y-y)<Math.min(3,height*.28));if(!line){line={text:'',x,y,end:x,height};lines.push(line);}const raw=item.str.replace(/\u0000/g,' ');if(line.text&&x-line.end>height*.15&&!/\s$/.test(line.text)&&!/^\s/.test(raw))line.text+=' ';line.text+=raw;line.end=x+item.width;}
 lines.sort((a,b)=>a.y-b.y||a.x-b.x);let removed=0;const body=lines.filter(l=>{if((l.y>pageHeight*.9||l.y<pageHeight*.07)&&/^\s*[-–]?\s*\d{1,4}\s*[-–]?\s*$/.test(l.text)){removed++;return false;}return true;});const baseline=body.length?Math.min(...body.map(l=>l.x)):0;let text='',previous;
 for(const line of body){const t=line.text.replace(/[\t ]+/g,' '),heading=/^(?:제\s*\d+\s*[강장]\s|\d+[.)]\s|\(\d+\)\s|목차|(?:chapter|lesson|lecture)\s+\d+)/i.test(t.trim());const para=!previous||heading||line.y-previous.y>line.height*2||line.x-previous.x>line.height*.65||/[.!?。][”’"')]*$/.test(previous.text.trim());const en=previous&&/[A-Za-z0-9]$/.test(previous.text)&&/^[A-Za-z0-9]/.test(t);text+=(text?(para?'\n':/\s$/.test(previous?.text||'')||en?' ':''):'')+t;previous=line;}
 const first=body[0],last=body.at(-1);
 const heading=first&&/^(?:제\s*\d+\s*[강장]\s|\d+[.)]\s|\(\d+\)\s|목차|(?:chapter|lesson|lecture)\s+\d+)/i.test(first.text.trim());
 return {text:text.trim(),removedPageNumbers:removed,empty:text.trim().length===0,startsWithContinuation:!!first&&!heading&&first.x-baseline<first.height*.5,endsWithSpace:!!last&&/\s$/.test(last.text)};
}
