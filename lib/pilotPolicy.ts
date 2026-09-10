/** An atomic reservation: concurrent callers cannot exceed the shared allowance. */
export const reserveQuotaSql=`INSERT INTO pilot_usage (id, used) SELECT ?, 1 WHERE ?>0
 ON CONFLICT(id) DO UPDATE SET used=pilot_usage.used+1 WHERE pilot_usage.used<? RETURNING used`;
export function quotaLimit(value:string|undefined){return value&&/^\d+$/.test(value)?Math.min(Number(value),100):0;}
export const aiDisabledMessage='Live AI is paused for this pilot. You can still explore, read sources, and keep your draft.';
export const pilotFeatures={settingImages:false} as const;
