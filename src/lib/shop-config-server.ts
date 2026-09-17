import { query, isDbConfigured } from "@/lib/db";
import { DEFAULT_SHOP_CONFIG, normalizeShopConfig, type ShopConfig } from "@/lib/shop-config";

/** Load the shop page configuration, falling back to defaults when unset. */
export async function getShopConfig(): Promise<ShopConfig> {
  if (!isDbConfigured()) return DEFAULT_SHOP_CONFIG;
  try {
    const rows = await query(
      `SELECT config FROM gg_admin_shop_config WHERE id = 1 LIMIT 1`
    );
    if (!rows || rows.length === 0) return DEFAULT_SHOP_CONFIG;
    return normalizeShopConfig(rows[0].config);
  } catch {
    return DEFAULT_SHOP_CONFIG;
  }
}