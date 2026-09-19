import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { Readable } from 'node:stream';
import worker from './dist/server/index.js';

const port=Number(process.env.PORT||3002);
const host=process.env.HOST||'0.0.0.0';
const publicRoot=join(process.cwd(),'dist','client');
const types={'.wasm':'application/wasm','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.ico':'image/x-icon','.rsc':'text/x-component'};

function staticPath(pathname){
 const decoded=decodeURIComponent(pathname);
 const relative=normalize(decoded).replace(/^([/\\])+/, '');
 const candidate=join(publicRoot,relative);
 return candidate.startsWith(publicRoot+'/')&&existsSync(candidate)&&statSync(candidate).isFile()?candidate:null;
}

const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',`http://${req.headers.host||`127.0.0.1:${port}`}`);
  const asset=staticPath(url.pathname);
  if(asset){res.writeHead(200,{'Content-Type':types[extname(asset).toLowerCase()]||'application/octet-stream','Cache-Control':url.pathname.startsWith('/_next/')?'public, max-age=31536000, immutable':'no-cache'});createReadStream(asset).pipe(res);return}
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const body=chunks.length?Buffer.concat(chunks):undefined;
  const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(Array.isArray(value))value.forEach(v=>headers.append(key,v));else if(value!==undefined)headers.set(key,value)}
  const request=new Request(url,{method:req.method,headers,body});
  const response=await worker.fetch(request,{}, {waitUntil(){},passThroughOnException(){}});
  res.writeHead(response.status,Object.fromEntries(response.headers.entries()));
  if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end();
 }catch(error){console.error(error);res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('서버 오류가 발생했습니다.')}
});

server.listen(port,host,()=>console.log(`Audiobook2 server listening on http://${host}:${port}`));
