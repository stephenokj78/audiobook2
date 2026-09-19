const requests=new WeakMap();
export function cancelPlayback(player){if(!player)return;requests.set(player,{});player.pause();}
export async function startPlayback(player,onError){
 const request={};requests.set(player,request);const source=player.src;
 try{await player.play();}catch(error){
  if(requests.get(player)!==request||player.src!==source||error?.name==='AbortError')return;
  onError(error);
 }
}
