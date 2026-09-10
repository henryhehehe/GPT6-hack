import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {runEvaluation,hash,type Report,type LearningTools,type Suite} from './curriculum-evaluation/runner';
import {reportHtml} from './curriculum-evaluation/report';

async function main(){
 const args=process.argv.slice(2),caseIds:string[]=[];
 let live=false,baseUrl='http://localhost:5173',outputRoot='artifacts/private/curriculum-evaluations';
 let suite:Suite='formative';
 for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(arg==='--help'){console.log('Usage: node --import tsx scripts/evaluate-curriculum.ts [--suite formative|historical] [--live] [--case EXAMPLE_ID] [--base http://localhost:5173] [--out DIRECTORY]\nDefault: formative suite, local preflight only; no HTTP or model calls. Live mode requires configured teacher access and AI allowance. Credentials are read only from CURRICULUM_EVAL_TEACHER_CODE or CURRICULUM_EVAL_CLASS_ID plus CURRICULUM_EVAL_TEACHER_TOKEN.');return;}
  if(arg==='--live'){live=true;continue;}
  if(!['--suite','--case','--base','--out'].includes(arg)||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Invalid arguments. Use --help for supported options.');
  const value=args[++i];if(arg==='--suite'){if(value!=='formative'&&value!=='historical')throw new Error('Unknown evaluation suite.');suite=value;}else if(arg==='--case')caseIds.push(value);else if(arg==='--base')baseUrl=value;else outputRoot=value;
 }
 const classId=process.env.CURRICULUM_EVAL_CLASS_ID,teacherToken=process.env.CURRICULUM_EVAL_TEACHER_TOKEN;
 if(!!classId!==!!teacherToken)throw new Error('Supply both evaluation classroom ID and teacher token, or neither.');
 let gitCommit='unavailable';try{gitCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
 const paths=['app/api/classroom/route.ts','lib/server.ts','lib/world.ts','lib/curriculum.ts'];
 const localCodeHashes=Object.fromEntries(await Promise.all(paths.map(async path=>[path,hash(await readFile(path,'utf8'))])));
 try{localCodeHashes['lib/learning.ts']=hash(await readFile('lib/learning.ts','utf8'));}catch{localCodeHashes['lib/learning.ts']='not present';}
 let directory='';
 const save=async(report:Report)=>{
  if(!directory){directory=join(resolve(outputRoot),report.runId);await mkdir(directory,{recursive:true,mode:0o700});}
  const record={...report,localCheckout:{gitCommit,files:localCodeHashes,note:'Local source fingerprint only; not independent proof of the server build.'}};
  for(const [name,content] of [['report.json',JSON.stringify(record,null,2)+'\n'],['review.html',reportHtml(report)]]){
   const temp=join(directory,name+'.tmp');await writeFile(temp,content,{mode:0o600});await rename(temp,join(directory,name));
  }
 };
 let learning:LearningTools|undefined;
 if(live){try{
  const modulePath=pathToFileURL(resolve('lib/learning.ts')).href;
  const module=await import(modulePath);
  if(typeof module.materials==='function'&&typeof module.sourceVersion==='function')learning=module;
 }catch{}}
 const report=await runEvaluation({baseUrl,live,suite,caseIds,learning,teacherCode:process.env.CURRICULUM_EVAL_TEACHER_CODE,parent:classId&&teacherToken?{id:classId,teacherToken}:undefined,save});
 console.log(`${report.status}: ${report.results.filter(r=>r.status==='captured').length}/${report.results.length} responses captured; human review pending.\n${join(directory,'review.html')}\n${join(directory,'report.json')}`);
 if(report.error)console.log(report.error);
 if(report.status==='blocked'||report.status==='interrupted')process.exitCode=2;
 else if(report.results.some(r=>r.status==='invalid-result'))process.exitCode=1;
}
main().catch(()=>{console.error('Evaluation could not start or save its report. Check arguments, local files, and output permissions; no credentials are printed.');process.exitCode=2;});
