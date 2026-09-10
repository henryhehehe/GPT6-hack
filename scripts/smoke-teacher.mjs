// Optional login for checks against the gated production candidate. Never log the cookie.
export async function smokeTeacherHeaders(base,headers={}){
 const code=process.env.PILOT_TEST_TEACHER_CODE;
 if(!code)return {};
 const response=await fetch(base+'/api/teacher-access',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({code})});
 if(!response.ok)throw new Error('Smoke teacher login failed.');
 const cookie=response.headers.get('set-cookie')?.split(';')[0];
 if(!cookie)throw new Error('Smoke teacher session missing.');
 return {Cookie:cookie};
}
