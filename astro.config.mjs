// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Default output is 'static'; only routes with prerender = false become Vercel functions.
export default defineConfig({ adapter: vercel() });
