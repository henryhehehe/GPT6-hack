import Classroom from '@/components/worlds/Classroom';
export default async function Trial({searchParams}:{searchParams:Promise<{museum?:string}>}){const params=await searchParams;return <Classroom publicTrial startMuseumTour={params.museum==='1'}/>;}
