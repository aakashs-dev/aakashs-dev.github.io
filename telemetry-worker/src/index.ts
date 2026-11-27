/**
 * Cloudflare Worker collector for aakashs-dev.github.io (Option B).
 *
 * Resolves coarse geo (city, region, country, timezone) and network org
 * (ASN, asOrganization) at the Cloudflare edge from `request.cf`, computes a
 * non-reversible daily-salted hash for daily unique-visitor counts, and
 * discards the raw IP address without ever storing or logging it.
 */

export interface KvNamespaceLike {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>;
  list(options?: {
    prefix?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

export interface Env {
  TELEMETRY_KV: KvNamespaceLike;
  ALLOWED_ORIGIN: string;
  STATS_TOKEN: string;
  HASH_SALT?: string;
}

interface IncomingEvent {
  type: 'page_view' | 'section_view' | 'dossier_open' | 'web_vital';
  ts: string;
  path: string;
  target?: string;
  value?: number;
  viewport?: 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
  referrerHost?: string | null;
  colorScheme?: 'light' | 'dark';
  tz?: string;
}

interface StoredRecord {
  ts: string;
  day: string;
  visitorHash: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  asn: number | null;
  org: string;
  browser: string;
  os: string;
  events: IncomingEvent[];
}

interface CfProperties {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  asn?: number;
  asOrganization?: string;
}

const MAX_BODY_BYTES = 8_192;
const MAX_EVENTS_PER_BATCH = 25;
const KV_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days auto-expiry
const ALLOWED_TYPES = new Set(['page_view', 'section_view', 'dossier_open', 'web_vital']);
const BOT_PATTERN = /bot|crawler|spider|slurp|headless|lighthouse|pingdom|uptime|curl|wget|python-requests/i;

function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  const allow = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

function parseOs(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

async function dailyVisitorHash(day: string, ip: string, ua: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${day}:${salt}:${ip}:${ua}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 6)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isAuthorized(authHeader: string | null, expectedToken: string | undefined): Promise<boolean> {
  if (!authHeader || !expectedToken || !authHeader.startsWith('Bearer ')) return false;
  const provided = authHeader.slice('Bearer '.length).trim();
  const [a, b] = await Promise.all([sha256Hex(provided), sha256Hex(expectedToken)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function sanitiseEvents(raw: unknown): IncomingEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: IncomingEvent[] = [];
  for (const item of raw.slice(0, MAX_EVENTS_PER_BATCH)) {
    if (!item || typeof item !== 'object') continue;
    const e = item as Record<string, unknown>;
    if (typeof e['type'] !== 'string' || !ALLOWED_TYPES.has(e['type'])) continue;
    out.push({
      type: e['type'] as IncomingEvent['type'],
      ts: typeof e['ts'] === 'string' ? e['ts'].slice(0, 32) : new Date().toISOString(),
      path: typeof e['path'] === 'string' ? e['path'].split('?')[0].slice(0, 120) : '/',
      ...(typeof e['target'] === 'string' ? { target: e['target'].slice(0, 80) } : {}),
      ...(typeof e['value'] === 'number' && Number.isFinite(e['value']) ? { value: e['value'] } : {}),
      ...(typeof e['viewport'] === 'string' ? { viewport: e['viewport'] as IncomingEvent['viewport'] } : {}),
      ...(typeof e['referrerHost'] === 'string' ? { referrerHost: e['referrerHost'].slice(0, 120) } : {}),
      ...(e['colorScheme'] === 'light' || e['colorScheme'] === 'dark' ? { colorScheme: e['colorScheme'] } : {}),
      ...(typeof e['tz'] === 'string' ? { tz: e['tz'].slice(0, 64) } : {}),
    });
  }
  return out;
}

function increment(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function sortedTop(map: Record<string, number>, limit = 15): { name: string; count: number }[] {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(3)) : sorted[mid];
}

async function handleCollect(request: Request, env: Env, origin: string): Promise<Response> {
  const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);
  if (origin && origin !== env.ALLOWED_ORIGIN) {
    return new Response('Forbidden origin', { status: 403, headers });
  }

  const ua = request.headers.get('User-Agent') ?? '';
  if (!ua || BOT_PATTERN.test(ua)) {
    return new Response(null, { status: 204, headers });
  }

  const text = await request.text();
  if (text.length === 0 || text.length > MAX_BODY_BYTES) {
    return new Response('Invalid payload size', { status: 400, headers });
  }

  let parsed: { events?: unknown };
  try {
    parsed = JSON.parse(text) as { events?: unknown };
  } catch {
    return new Response('Invalid JSON', { status: 400, headers });
  }

  const events = sanitiseEvents(parsed.events);
  if (events.length === 0) {
    return new Response(null, { status: 204, headers });
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  // Raw IP is used transiently in-memory only to compute a daily-rotated non-reversible hash,
  // then immediately discarded — never stored in KV or written to logs.
  const transientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const visitorHash = await dailyVisitorHash(day, transientIp, ua, env.HASH_SALT ?? 'default-daily-salt');

  const cf = ((request as Request & { cf?: CfProperties }).cf ?? {}) as CfProperties;
  const record: StoredRecord = {
    ts: now.toISOString(),
    day,
    visitorHash,
    country: cf.country ?? 'Unknown',
    region: cf.region ?? '',
    city: cf.city ?? 'Unknown',
    timezone: cf.timezone ?? '',
    asn: typeof cf.asn === 'number' ? cf.asn : null,
    org: cf.asOrganization ?? 'Unknown',
    browser: parseBrowser(ua),
    os: parseOs(ua),
    events,
  };

  const suffix = crypto.randomUUID().slice(0, 8);
  const key = `evt:${day}:${now.getTime()}:${suffix}`;
  await env.TELEMETRY_KV.put(key, JSON.stringify(record), { expirationTtl: KV_TTL_SECONDS });

  return new Response(null, { status: 204, headers });
}

async function handleStats(request: Request, env: Env, origin: string): Promise<Response> {
  const headers = { ...corsHeaders(origin, env.ALLOWED_ORIGIN), 'Content-Type': 'application/json' };
  const authed = await isAuthorized(request.headers.get('Authorization'), env.STATS_TOKEN);
  if (!authed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') ?? '7') || 7));

  const dayList: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86_400_000);
    dayList.push(d.toISOString().slice(0, 10));
  }

  const records: StoredRecord[] = [];
  for (const day of dayList) {
    let cursor: string | undefined;
    do {
      const listed = await env.TELEMETRY_KV.list({ prefix: `evt:${day}:`, cursor, limit: 200 });
      const values = await Promise.all(listed.keys.map((k) => env.TELEMETRY_KV.get(k.name, 'json')));
      for (const v of values) {
        if (v) records.push(v as StoredRecord);
      }
      cursor = listed.list_complete ? undefined : listed.cursor;
    } while (cursor);
  }

  records.sort((a, b) => b.ts.localeCompare(a.ts));

  const byDay: Record<string, { views: number; uniques: Set<string> }> = {};
  const byLocation: Record<string, number> = {};
  const byOrg: Record<string, number> = {};
  const byReferrer: Record<string, number> = {};
  const byViewport: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byOs: Record<string, number> = {};
  const byDossier: Record<string, number> = {};
  const bySection: Record<string, number> = {};
  const lcpSamples: number[] = [];
  const clsSamples: number[] = [];
  const allUniques = new Set<string>();
  let totalPageViews = 0;

  for (const r of records) {
    if (!byDay[r.day]) byDay[r.day] = { views: 0, uniques: new Set() };
    byDay[r.day].uniques.add(r.visitorHash);
    allUniques.add(`${r.day}:${r.visitorHash}`);

    for (const ev of r.events) {
      if (ev.type === 'page_view') {
        totalPageViews++;
        byDay[r.day].views++;
        const loc = [r.city, r.region, r.country].filter(Boolean).join(', ');
        increment(byLocation, loc || 'Unknown');
        increment(byOrg, r.org);
        increment(byReferrer, ev.referrerHost ?? 'direct');
        if (ev.viewport) increment(byViewport, ev.viewport);
        increment(byBrowser, r.browser);
        increment(byOs, r.os);
      } else if (ev.type === 'dossier_open' && ev.target) {
        increment(byDossier, ev.target);
      } else if (ev.type === 'section_view' && ev.target) {
        increment(bySection, ev.target);
      } else if (ev.type === 'web_vital' && typeof ev.value === 'number') {
        if (ev.target === 'LCP') lcpSamples.push(ev.value);
        if (ev.target === 'CLS') clsSamples.push(ev.value);
      }
    }
  }

  const summary = {
    windowDays: days,
    totalPageViews,
    uniqueDailyVisitors: allUniques.size,
    byDay: Object.entries(byDay)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, v]) => ({ day, views: v.views, uniqueVisitors: v.uniques.size })),
    topLocations: sortedTop(byLocation),
    topOrganizations: sortedTop(byOrg),
    topReferrers: sortedTop(byReferrer),
    viewports: sortedTop(byViewport),
    browsers: sortedTop(byBrowser),
    operatingSystems: sortedTop(byOs),
    dossiersOpened: sortedTop(byDossier),
    sectionsClicked: sortedTop(bySection),
    webVitals: {
      medianLcpMs: median(lcpSamples),
      medianCls: median(clsSamples),
      samples: { lcp: lcpSamples.length, cls: clsSamples.length },
    },
    recentVisits: records.slice(0, 25).map((r) => ({
      ts: r.ts,
      location: [r.city, r.region, r.country].filter(Boolean).join(', '),
      timezone: r.timezone,
      org: r.org,
      asn: r.asn,
      browser: r.browser,
      os: r.os,
      events: r.events,
    })),
  };

  return new Response(JSON.stringify(summary, null, 2), { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env.ALLOWED_ORIGIN) });
    }
    if ((url.pathname === '/v1/events' || url.pathname === '/collect') && request.method === 'POST') {
      return handleCollect(request, env, origin);
    }
    if (url.pathname === '/stats' && request.method === 'GET') {
      return handleStats(request, env, origin);
    }
    return new Response('Not found', { status: 404 });
  },
};
