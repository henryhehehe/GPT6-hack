// Local, allowlisted asset inspection server; never exposes the workspace root.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary'};
const server=createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let path;
    if(pathname==='/')path=resolve(root,'assets/model-viewer.html');
    else if(pathname==='/model-manifest.json')path=resolve(root,'assets/model-manifest.json');
    else {
      const match=[['/models/','public/models'],['/three/','node_modules/three']].find(([prefix])=>pathname.startsWith(prefix));
      if(!match){res.writeHead(404).end('Not found');return;}
      const base=resolve(root,match[1]);path=resolve(base,pathname.slice(match[0].length));
      if(!path.startsWith(base+sep)){res.writeHead(403).end('Forbidden');return;}
    }
    const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404).end('Not found');}
});
server.listen(5198,'127.0.0.1',()=>console.log('Model studio: http://127.0.0.1:5198'));
