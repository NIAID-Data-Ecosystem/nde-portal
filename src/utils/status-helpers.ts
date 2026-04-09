/**
 * Status page utilities — types, constants, and localStorage helpers
 * for the /status page uptime monitoring.
 */

export type EndpointStatus = 'operational' | 'degraded' | 'down';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: EndpointStatus | 'no-data';
  incidents: number;
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  checkHealth: (response: Response, data: any) => EndpointStatus;
  extractInfo?: (data: any) => Record<string, string>;
}

export interface EndpointState {
  id: string;
  name: string;
  status: EndpointStatus | 'loading';
  responseTime: number | null;
  lastChecked: Date | null;
  history: DayStatus[];
  error?: string;
  extraInfo?: Record<string, string>;
}

export type OverallStatus = 'operational' | 'partial' | 'major';

// --- Colors ---

export const STATUS_COLORS = {
  operational: { bg: '#dafbe1', text: '#1a7f37' },
  degraded: { bg: '#fff8c5', text: '#9a6700' },
  down: { bg: '#ffebe9', text: '#cf222e' },
} as const;

export const BAR_COLORS: Record<EndpointStatus | 'no-data', string> = {
  operational: '#2da44e',
  degraded: '#d4a72c',
  down: '#cf222e',
  'no-data': '#d0d7de',
};

// --- Date helpers ---

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- History helpers ---

const STORAGE_PREFIX = 'status_history_';

function getStorageKey(endpointId: string) {
  return `${STORAGE_PREFIX}${endpointId}`;
}

export function initializeHistory(): DayStatus[] {
  const days: DayStatus[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: formatDateKey(d), status: 'no-data', incidents: 0 });
  }
  return days;
}

export function loadHistory(endpointId: string): DayStatus[] {
  try {
    const raw = localStorage.getItem(getStorageKey(endpointId));
    if (raw) {
      const parsed: DayStatus[] = JSON.parse(raw);
      // Ensure we always have exactly 90 days, filling gaps with no-data
      const map = new Map(parsed.map(d => [d.date, d]));
      const base = initializeHistory();
      return base.map(d => map.get(d.date) ?? d);
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return initializeHistory();
}

export function saveHistory(endpointId: string, history: DayStatus[]) {
  try {
    localStorage.setItem(getStorageKey(endpointId), JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

const STATUS_SEVERITY: Record<string, number> = {
  'no-data': 0,
  operational: 1,
  degraded: 2,
  down: 3,
};

export function upsertTodayStatus(
  history: DayStatus[],
  status: EndpointStatus,
): DayStatus[] {
  const today = formatDateKey(new Date());
  const updated = [...history];
  const idx = updated.findIndex(d => d.date === today);

  if (idx >= 0) {
    const existing = updated[idx];
    const worstStatus =
      STATUS_SEVERITY[status] > STATUS_SEVERITY[existing.status]
        ? status
        : existing.status === 'no-data'
        ? status
        : existing.status;
    updated[idx] = {
      date: today,
      status: worstStatus as EndpointStatus,
      incidents: existing.incidents + (status !== 'operational' ? 1 : 0),
    };
  } else {
    updated.push({
      date: today,
      status,
      incidents: status !== 'operational' ? 1 : 0,
    });
    if (updated.length > 90) updated.shift();
  }

  return updated;
}

// --- Calculations ---

export function calculateUptimePercent(history: DayStatus[]): number {
  const withData = history.filter(d => d.status !== 'no-data');
  if (withData.length === 0) return 100;
  const operational = withData.filter(d => d.status === 'operational').length;
  return Number(((operational / withData.length) * 100).toFixed(2));
}

export function getOverallStatus(
  statuses: (EndpointStatus | 'loading')[],
): OverallStatus {
  const resolved = statuses.filter((s): s is EndpointStatus => s !== 'loading');
  if (resolved.length === 0) return 'operational';
  if (resolved.every(s => s === 'operational')) return 'operational';
  if (resolved.some(s => s === 'down')) return 'major';
  return 'partial';
}

export function formatUptimeDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}
