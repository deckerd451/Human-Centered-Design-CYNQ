import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
// @ts-expect-error - __STATIC_CONTENT_MANIFEST is a virtual module provided by wrangler
import manifest from '__STATIC_CONTENT_MANIFEST';
import { Env } from './core-utils';
/**
 * Configures the Hono app to serve static assets.
 * In a typical Cloudflare Pages setup, this might be handled automatically.
 * This module provides an explicit way to serve frontend assets from the worker,
 * which is useful for certain deployment configurations or for ensuring consistent behavior.
 *
 * It serves the single-page application's entrypoint (index.html) for any non-API, non-asset path,
 * and serves bundled assets (like JS, CSS) from the /assets/ directory.
 */
export function configureStaticAssets(app: Hono<{ Bindings: Env }>) {
  // Serve bundled static assets (e.g., /assets/index-*.js)
  app.use('/assets/*', serveStatic({ root: './dist/client', manifest }));
  // Serve all other non-API routes from the single-page app's entry point.
  // This is the "SPA mode" handler.
  app.get('*', serveStatic({ path: './dist/client/index.html', manifest }));
}