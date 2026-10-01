/** Safe DEV-only traces for social state transitions.  Never include tokens,
 * emails, captions/comments, media URIs or response payloads. */
function enabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function trace(channel: string, stage: string, details: Record<string, unknown>): void {
  if (!enabled()) return;
  console.info(`[${channel}]`, JSON.stringify({ stage, timestamp: new Date().toISOString(), ...details }));
}

export const traceSocialRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_SOCIAL_TRACE', stage, details);
export const traceProfileRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_PROFILE_TRACE', stage, details);
export const traceFeedRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_FEED_TRACE', stage, details);
export const traceInteractionRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_INTERACTION_TRACE', stage, details);
export const traceStoryRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_STORY_TRACE', stage, details);
export const traceMessageRuntime = (stage: string, details: Record<string, unknown>) => trace('YEYAMO_MESSAGE_TRACE', stage, details);
