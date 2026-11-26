export interface TelemetryConfig {
  /**
   * Deployed Cloudflare Worker collect endpoint, e.g.:
   * 'https://portfolio-telemetry.<your-subdomain>.workers.dev/collect'
   * Leave empty to keep telemetry disabled until the worker is deployed.
   */
  readonly endpoint: string;
  readonly maxEventsPerSession: number;
}

export const TELEMETRY_CONFIG: TelemetryConfig = {
  endpoint: 'https://portfolio-telemetry.foundry-ops.workers.dev/collect',
  maxEventsPerSession: 25,
};
