/* assets/js/whatsapp-api.js */
const WH_BASE = (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/integrations/whatsapp';

async function waFetch(path, opts={}){
  const headers = { ...(opts.headers||{}), 'Content-Type':'application/json' };
  if (typeof TOKEN !== 'undefined' && TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
  const res = await fetch(WH_BASE + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const text = await res.text();
  try{
    const json = JSON.parse(text);
    if (!res.ok || json.error) throw new Error(json.error || res.statusText);
    return json;
  }catch{
    if (!res.ok) throw new Error(text || res.statusText);
    return text;
  }
}

export async function sendWhatsText(to, body){ return waFetch('/send-text', { method:'POST', body:{ to, body } }); }
export async function sendWhatsTemplate(to, template, languageCode='pt_BR', parameters=[]){
  return waFetch('/send-template', { method:'POST', body:{ to, template, languageCode, parameters } });
}
export async function sendWhatsDocument(to, link, filename='comprovante.pdf', caption=''){
  return waFetch('/send-document', { method:'POST', body:{ to, link, filename, caption } });
}
