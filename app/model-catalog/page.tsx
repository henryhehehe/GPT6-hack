import ModelCatalog from '@/components/models/ModelCatalog';
import CharacterCatalog from '@/components/models/CharacterCatalog';
export const metadata={title:'Model catalog — Counterfactual Worlds',description:'Scene art and teaching characters with previews, usage guidance and provenance.'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams;
 return query.collection==='characters'?<CharacterCatalog initialAssetId={typeof query.asset==='string'?query.asset:undefined} initialScene={typeof query.scene==='string'?query.scene:undefined}/>:<ModelCatalog/>;
}
