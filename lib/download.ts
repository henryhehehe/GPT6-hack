/** Download directly from the browser; no upload, account, or AI request. */
export function downloadHtml(filename:string,html:string) {
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
