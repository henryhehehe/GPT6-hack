export async function boundedJson(request:Request,limit=30000):Promise<Record<string,unknown>>{
 if(Number(request.headers.get('Content-Length')||0)>limit)throw new Error('Request too large');
 const reader=request.body?.getReader();if(!reader)throw new Error('Request body is missing');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Expected an object');return value;
}
