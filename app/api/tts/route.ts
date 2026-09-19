const TTS_ENDPOINT='https://texttomp3.autosdl.org/api/tts';
const ALLOWED_VOICES=new Set([
 'ko-KR-SunHiNeural',
 'ko-KR-InJoonNeural',
 'en-US-EmmaMultilingualNeural',
 'en-US-AndrewMultilingualNeural',
]);

export async function POST(request:Request){
 try{
  const body=await request.json() as {text?:unknown;voice?:unknown};
  const text=typeof body.text==='string'?body.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u200b\ufeff]/g,'').trim():'';
  const voice=typeof body.voice==='string'&&ALLOWED_VOICES.has(body.voice)?body.voice:'ko-KR-SunHiNeural';
  if(!/[\p{L}\p{N}]/u.test(text))return new Response('읽을 글이 비어 있습니다.',{status:400});
  if(text.length>1200)return new Response('한 번에 읽을 글이 너무 깁니다.',{status:400});

  let upstream:Response|undefined;
  let lastError='';
  let audio:ArrayBuffer|undefined;
  for(let attempt=1;attempt<=3;attempt++){
   try{
    upstream=await fetch(TTS_ENDPOINT,{
     method:'POST',
     headers:{'Content-Type':'application/json','Accept':'audio/mpeg','User-Agent':'BookReading/1.0'},
     body:JSON.stringify({text,voice}),
     signal:AbortSignal.timeout(45000),
    });
    if(upstream.ok&&upstream?.headers.get('content-type')?.startsWith('audio/')){const data=await upstream.arrayBuffer();if(data.byteLength){audio=data;break;}lastError='No audio was received.';}else{
    lastError=await upstream.text().catch(()=>`음성 서버 HTTP ${upstream?.status}`);}
   }catch(error){lastError=error instanceof Error?error.message:String(error)}
   if(attempt<3)await new Promise(resolve=>setTimeout(resolve,attempt*900));
  }
  if(!audio)return new Response(`음성 서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요. ${lastError}`.trim(),{status:502});
  return new Response(audio,{
   status:200,
   headers:{'Content-Type':upstream?.headers.get('content-type')||'audio/mpeg','Cache-Control':'no-store'},
  });
 }catch{
  return new Response('음성 요청을 처리하지 못했습니다.',{status:500});
 }
}
