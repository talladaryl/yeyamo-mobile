/** Development-only traces for create flows; never log captions, locations or URIs. */
export function traceCreateRuntime(stage: string, details: Record<string, unknown> = {}): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  console.info('[YEYAMO_CREATE_TRACE]', JSON.stringify({ stage, at: new Date().toISOString(), ...details }));
}
