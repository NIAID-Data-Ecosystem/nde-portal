import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EndpointConfig,
  EndpointState,
  EndpointStatus,
  loadHistory,
  saveHistory,
  upsertTodayStatus,
  initializeHistory,
} from 'src/utils/status-helpers';

const POLL_INTERVAL = 60_000;

export function useEndpointHealth(config: EndpointConfig) {
  const [state, setState] = useState<EndpointState>({
    id: config.id,
    name: config.name,
    status: 'loading',
    responseTime: null,
    lastChecked: null,
    history: initializeHistory(),
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    let status: EndpointStatus = 'down';
    let error: string | undefined;
    let extraInfo: Record<string, string> | undefined;

    try {
      const res = await fetch(config.url, { cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);

      if (!res.ok) {
        status = 'down';
        error = `HTTP ${res.status}`;
      } else {
        try {
          const data = await res.json();
          console.log('Health check response for', config.name, data);
          status = config.checkHealth(res, data);
          if (config.extractInfo) {
            extraInfo = config.extractInfo(data);
          }
        } catch {
          // Response body doesn't match expected schema
          status = 'degraded';
          error = 'Unexpected response format';
        }
      }

      setState(prev => {
        const history = upsertTodayStatus(prev.history, status);
        saveHistory(config.id, history);
        return {
          ...prev,
          status,
          responseTime: elapsed,
          lastChecked: new Date(),
          history,
          error,
          extraInfo,
        };
      });
    } catch {
      const elapsed = Math.round(performance.now() - start);
      setState(prev => {
        const history = upsertTodayStatus(prev.history, 'down');
        saveHistory(config.id, history);
        return {
          ...prev,
          status: 'down',
          responseTime: elapsed,
          lastChecked: new Date(),
          history,
          error: 'Unable to reach endpoint',
          extraInfo: undefined,
        };
      });
    }

    // setSecondsAgo(0);
  }, [config]);

  useEffect(() => {
    // Load persisted history from localStorage
    const history = loadHistory(config.id);
    setState(prev => ({ ...prev, history }));

    // Initial check
    checkHealth();

    // Poll every 60s
    intervalRef.current = setInterval(checkHealth, POLL_INTERVAL);

    // Tick "seconds ago" counter
    // tickRef.current = setInterval(() => {
    //   setSecondsAgo(prev => prev + 1);
    // }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(tickRef.current);
    };
  }, [checkHealth]);

  return state;
}
