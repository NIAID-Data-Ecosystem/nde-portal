// Include 1.5 so ranges like 287,487 can land on 300,000 (step 150,000)
// instead of jumping to 400,000 (step 200,000).
const NICE_MULTIPLIERS = [1, 1.5, 2, 3, 5, 10] as const;

function niceCeil(value: number) {
  if (value <= 0) return 1;

  const pow10 = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / pow10;

  const m =
    NICE_MULTIPLIERS.find(mult => scaled <= mult) ??
    NICE_MULTIPLIERS[NICE_MULTIPLIERS.length - 1];

  return m * pow10;
}

export function makeNiceTicks({
  maxValue,
  targetTickCount,
}: {
  maxValue: number;
  targetTickCount?: number;
}) {
  const max = Math.max(0, maxValue || 0);
  if (max === 0) return { niceMax: 0, tickValues: [0] };

  const resolvedTickCount = targetTickCount ?? (max >= 100_000 ? 4 : 3);

  // Derive a nice step from the data range, then round the domain max up to
  // the nearest multiple of that step — keeps the axis tight to the data.
  const rawStep = max / Math.max(1, resolvedTickCount - 1);
  // Counts are whole numbers, so keep step/ticks as integers.
  const step = Math.max(1, Math.ceil(niceCeil(rawStep)));
  const niceMax = step * Math.ceil(max / step);

  const tickValues: number[] = [];
  const tickCount = Math.max(1, Math.round(niceMax / step));
  for (let i = 0; i <= tickCount; i += 1) {
    tickValues.push(i * step);
  }

  if (tickValues[tickValues.length - 1] !== niceMax) {
    tickValues.push(niceMax);
  }

  return { niceMax, tickValues };
}
