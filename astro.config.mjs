// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Default output is 'static'; only routes with prerender = false become Vercel functions.
// maxDuration 60s: /api/chat streams tokens for the whole reply, holding the function
// open the entire time — the Hobby default of 10s can kill a slow long answer mid-stream
// (cutting the reply and skipping the post-stream Supabase log). 60s is a safety ceiling,
// not a target; fast replies still finish in a few seconds.
export default defineConfig({ adapter: vercel({ maxDuration: 60 }) });
