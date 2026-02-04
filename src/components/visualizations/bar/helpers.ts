const NICE_MULTIPLIERS = [1, 2, 5, 10] as const;

function niceCeil(value: number) {
  if (value <= 0) return 0;

  const pow10 = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / pow10;

  const m =
    NICE_MULTIPLIERS.find(mult => scaled <= mult) ??
    NICE_MULTIPLIERS[NICE_MULTIPLIERS.length - 1];

  return m * pow10;
}

function niceStep(niceMax: number, targetTickCount: number) {
  if (niceMax <= 0) return 1;

  const rawStep = niceMax / Math.max(1, targetTickCount - 1);
  const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const scaled = rawStep / pow10;

  const m =
    NICE_MULTIPLIERS.find(mult => scaled <= mult) ??
    NICE_MULTIPLIERS[NICE_MULTIPLIERS.length - 1];

  return m * pow10;
}

export function makeNiceTicks({
  maxValue,
  targetTickCount = 3,
}: {
  maxValue: number;
  targetTickCount?: number;
}) {
  const max = Math.max(0, maxValue || 0);
  if (max === 0) return { niceMax: 0, tickValues: [0] };

  // 1) always round UP
  const niceMax = niceCeil(max);

  // 2) derive step from niceMax
  const step = niceStep(niceMax, targetTickCount);

  // 3) generate ticks
  const tickValues: number[] = [];
  for (let v = 0; v <= niceMax + step / 2; v += step) {
    tickValues.push(v);
  }

  return { niceMax, tickValues };
}
