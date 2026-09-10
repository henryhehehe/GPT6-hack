import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {sceneCraftReport,sceneCraftMarkdown,findSceneCraftProfiles} from '../lib/sceneCraftReport';
import {SceneCraftProfileSchema} from '../lib/sceneCraft';

const usage=`Scene authoring toolkit (read-only unless --out is supplied)
  node --import tsx scripts/scene-brief.ts --list [--region Egypt] [--period Regency] [--creature mythic]
  node --import tsx scripts/scene-brief.ts --world odyssey-ix [--format markdown|json] [--out path]
  node --import tsx scripts/scene-brief.ts --world alexandria --review-template [--out path]
  node --import tsx scripts/scene-brief.ts --validate docs/scene-craft/TEMPLATE.json
This exports design targets, current assets and review steps; it never changes a scene or claims review completion.`;
function main(){
 const args=process.argv.slice(2),values:Record<string,string>={},flags=new Set<string>();
 const boolean=new Set(['--list','--review-template','--help']),valued=new Set(['--world','--format','--out','--region','--period','--creature','--validate']);
 for(let i=0;i<args.length;i++){
  const key=args[i];if(flags.has(key)||Object.hasOwn(values,key))throw new Error(`Duplicate option ${key}`);
  if(boolean.has(key)){flags.add(key);continue;}
  if(!valued.has(key))throw new Error(`Unknown option ${key}`);
  const value=args[++i];if(!value||value.startsWith('--'))throw new Error(`Missing value for ${key}`);values[key]=value;
 }
 if(flags.has('--help')||!args.length){console.log(usage);return;}
 if(values['--validate']){
  if(flags.size||Object.keys(values).length!==1)throw new Error('--validate is a standalone operation.');
  const profile=SceneCraftProfileSchema.parse(JSON.parse(readFileSync(resolve(values['--validate']),'utf8')));
  console.log(`Valid brief structure: ${profile.worldId}. Historical accuracy, assets and runtime integration still require review.`);return;
 }
 if(flags.has('--list')===Boolean(values['--world']))throw new Error('Choose either --list or --world <id>.');
 const format=values['--format']??'markdown';if(!['markdown','json'].includes(format))throw new Error('Format must be markdown or json.');
 if(values['--world']&&['--region','--period','--creature'].some(key=>values[key]))throw new Error('Filters apply to --list only.');
 if(flags.has('--review-template')&&!values['--world'])throw new Error('--review-template requires --world.');
 let output:string;
 if(flags.has('--list')){
  const rows=findSceneCraftProfiles({region:values['--region'],period:values['--period'],creature:values['--creature']});
  output=format==='json'?JSON.stringify(rows,null,2):rows.map(r=>`${r.worldId} — ${r.region} — ${r.period}\n  ${r.signature}\n  Creatures: ${r.creatures.join('; ')||'none proposed'}`).join('\n\n')||'No matching scene briefs.';
 }else{
  const report=sceneCraftReport(values['--world']);
  output=flags.has('--review-template')?JSON.stringify(report.review,null,2):format==='json'?JSON.stringify(report,null,2):sceneCraftMarkdown(report);
 }
 if(values['--out']){const path=resolve(values['--out']);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,output+'\n');console.log(`Wrote ${path}`);}else console.log(output);
}
try{main();}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
