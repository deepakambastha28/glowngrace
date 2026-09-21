import { query, isDbConfigured } from "@/lib/db";
import { DEFAULT_CAREER_CONFIG, normalizeCareerConfig, type CareerConfig } from "@/lib/career-config";

/** Load the career page configuration, falling back to defaults when unset. */
export async function getCareerConfig(): Promise<CareerConfig> {
  if (!isDbConfigured()) return DEFAULT_CAREER_CONFIG;
  try {
    const rows = await query(
      `SELECT config FROM gg_admin_career_config WHERE id = 1 LIMIT 1`
    );
    if (!rows || rows.length === 0) return DEFAULT_CAREER_CONFIG;
    return normalizeCareerConfig(rows[0].config);
  } catch {
    return DEFAULT_CAREER_CONFIG;
  }
}