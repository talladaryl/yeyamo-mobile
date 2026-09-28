/** Development-only country/reference diagnostics without profile identifiers or tokens. */
export function traceCountryRuntime(stage: string, details: Record<string, unknown>): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  console.info('[YEYAMO_COUNTRY_TRACE]', JSON.stringify({ stage, at: new Date().toISOString(), ...details }));
}
