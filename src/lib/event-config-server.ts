import { query, isDbConfigured } from "@/lib/db";
import { DEFAULT_EVENT_CONFIG, normalizeEventConfig, type EventConfig } from "@/lib/event-config";

/** Load the events page configuration, falling back to defaults when unset. */
export async function getEventConfig(): Promise<EventConfig> {
  if (!isDbConfigured()) return DEFAULT_EVENT_CONFIG;
  try {
    const rows = await query(
      `SELECT config FROM gg_admin_event_config WHERE id = 1 LIMIT 1`
    );
    if (!rows || rows.length === 0) return DEFAULT_EVENT_CONFIG;
    return normalizeEventConfig(rows[0].config);
  } catch {
    return DEFAULT_EVENT_CONFIG;
  }
}