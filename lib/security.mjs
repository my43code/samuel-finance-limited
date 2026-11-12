export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export function email(value){return typeof value==='string'&&value.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)&&!/[\r\n]/.test(value);}
export function text(value,min,max,label){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)throw new HttpError(400,`${label} must contain ${min}–${max} characters.`);return value.trim();}
export function requireSameOrigin(request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new HttpError(403,'Please submit from this website.');if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw new HttpError(415,'JSON is required.');}
export function authorizedEmail(value,allowed){return !!value&&String(allowed||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).includes(value.toLowerCase());}
export const statuses=['new','in_progress','waiting','resolved','archived'];
