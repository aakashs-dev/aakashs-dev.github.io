export interface TelemetryConfig {
  /**
   * Deployed Cloudflare Worker ingest endpoint, e.g.:
   * 'https://portfolio-telemetry.<your-subdomain>.workers.dev/v1/events'
   * Leave empty to keep telemetry disabled until the worker is deployed.
   */
  readonly endpoint: string;
  readonly maxEventsPerSession: number;
}

export const TELEMETRY_CONFIG: TelemetryConfig = {
  endpoint: 'https://portfolio-telemetry.foundry-ops.workers.dev/v1/events',
  maxEventsPerSession: 25,
};
