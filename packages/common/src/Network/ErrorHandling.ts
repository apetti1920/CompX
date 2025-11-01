export const ErrorTypeStrings = ['info', 'warning', 'error'] as const;

export type CompXErrorJson = {
  errorType: (typeof ErrorTypeStrings)[number];
  name: string;
  message: string;
  stack?: CompXErrorJson;
};

export function isCompXErrorJson(d: any): d is CompXErrorJson {
  if (typeof d !== 'object' || Array.isArray(d)) return false;

  const requiredKeys = ['errorType', 'name', 'message'];
  if (!requiredKeys.every((k) => k in d)) return false;

  if (
    typeof d['errorType'] !== 'string' ||
    !ErrorTypeStrings.includes(d['errorType'] as (typeof ErrorTypeStrings)[number])
  )
    return false;
  if (typeof d['name'] !== 'string') return false;
  if (typeof d['message'] !== 'string') return false;
  if ('stack' in d && !isCompXErrorJson(d['stack'])) return false;

  return true;
}
