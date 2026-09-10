import type {Evidence} from '@/lib/world';

export default function SourceNoteReferences({references}:{references?:NonNullable<Evidence['context']>['references']}){
 if(!references?.length)return null;
 return <details><summary>Sources for this context note</summary><p>These reference pages may extend beyond the assigned reading.</p><ul>{references.map(reference=><li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul></details>;
}
