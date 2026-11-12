import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { authorizedEmail } from './security.mjs';
export async function adminIdentity(){const user=await getChatGPTUser();if(!user||!authorizedEmail(user.email,(env as any).ADMIN_EMAILS))return null;return user;}
