/** Wait for model attempts to settle and a subsequent frame to display their result.
 * Failed optional models count as settled: their existing fallbacks remain usable.
 */
export function trackSceneLoading(models:Promise<unknown>[],onReady:()=>void,onFirstFrame?:()=>void){
 let settled=false,finished=false,disposed=false,rendered=false;
 void Promise.allSettled(models).then(()=>{settled=true;});
 return {
  rendered(){
   if(disposed||finished)return;
   if(!rendered){rendered=true;onFirstFrame?.();}
   if(settled){finished=true;onReady();}
  },
  dispose(){disposed=true;},
 };
}
