import { Hono } from "hono";
import { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
    app.post('/api/rss-health', async (c) => {
        try {
            const { urls } = await c.req.json<{ urls: string[] }>();
            if (!Array.isArray(urls) || urls.length === 0) {
                return c.json({ error: '`urls` must be a non-empty array' }, 400);
            }
            // Limit the number of URLs to process in a single request
            const MAX_URLS = 50;
            if (urls.length > MAX_URLS) {
                return c.json({ error: `Too many URLs. Maximum is ${MAX_URLS}.` }, 400);
            }
            const statuses: Record<string, 'ok' | 'error'> = {};
            const checkUrl = async (url: string) => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
                    const response = await fetch(url, {
                        method: 'HEAD',
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'LVFeedIndex-HealthChecker/1.0',
                            'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
                        }
                    });
                    clearTimeout(timeoutId);
                    if (response.ok) {
                        statuses[url] = 'ok';
                    } else {
                        statuses[url] = 'error';
                    }
                } catch (error) {
                    statuses[url] = 'error';
                }
            };
            await Promise.allSettled(urls.map(checkUrl));
            return c.json({ statuses });
        } catch (error) {
            console.error('[API /rss-health] Error:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    });
}