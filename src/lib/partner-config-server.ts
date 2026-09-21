import { query, isDbConfigured } from "@/lib/db";
import {
  DEFAULT_PARTNER_CONFIG,
  normalizePartnerConfig,
  type PartnerConfig,
} from "@/lib/partner-config";

/** Load the partners page configuration, falling back to defaults when unset. */
export async function getPartnerConfig(): Promise<PartnerConfig> {
  if (!isDbConfigured()) return DEFAULT_PARTNER_CONFIG;
  try {
    const rows = await query(
      `SELECT config FROM gg_admin_partner_config WHERE id = 1 LIMIT 1`
    );
    if (!rows || rows.length === 0) return DEFAULT_PARTNER_CONFIG;
    return normalizePartnerConfig(rows[0].config);
  } catch {
    return DEFAULT_PARTNER_CONFIG;
  }
}