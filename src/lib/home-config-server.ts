import { query, isDbConfigured } from "@/lib/db";
import { DEFAULT_HOME_CONFIG, normalizeHomeConfig, type HomeConfig } from "@/lib/home-config";

/** Load the home page configuration, falling back to defaults when unset. */
export async function getHomeConfig(): Promise<HomeConfig> {
  if (!isDbConfigured()) return DEFAULT_HOME_CONFIG;
  try {
    const rows = await query(
      `SELECT config FROM gg_admin_home_config WHERE id = 1 LIMIT 1`
    );
    if (!rows || rows.length === 0) return DEFAULT_HOME_CONFIG;
    return normalizeHomeConfig(rows[0].config);
  } catch {
    return DEFAULT_HOME_CONFIG;
  }
}
