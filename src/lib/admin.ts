import { getAdminUserIdsRaw, getPublicAdminUserIdsRaw } from "@/lib/brand-env";

// Server-side: AGENTPETS_ADMIN_USER_IDS (private env). Authoritative for any
// gate that actually performs an admin action.
export function getAdminUserIds(): Set<string> {
  const raw = getAdminUserIdsRaw();
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return getAdminUserIds().has(userId);
}

// Client-safe: NEXT_PUBLIC_PETDEX_ADMIN_USER_IDS gives the same list to the
// browser bundle so client components (e.g. UserButton menu) can decide
// whether to show admin links. Visibility-only — every server route that
// mutates state still re-checks via isAdmin().
export function getPublicAdminUserIds(): Set<string> {
  const raw = getPublicAdminUserIdsRaw();
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminClientSafe(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return getPublicAdminUserIds().has(userId);
}

const HENRY_USER_ID = process.env.HENRY_USER_ID;
// Client-safe mirror — used by UI components to show / hide the
// 'Manage WeChat QR' menu entry. Same authoritative check on the server.
const PUBLIC_HENRY_USER_ID = process.env.NEXT_PUBLIC_HENRY_USER_ID;

export function canEditWeChatQr(userId: string | null | undefined): boolean {
  if (!userId) return false;
  if (isAdmin(userId)) return true;
  if (HENRY_USER_ID && userId === HENRY_USER_ID) return true;
  return false;
}

export function canEditWeChatQrClientSafe(
  userId: string | null | undefined,
): boolean {
  if (!userId) return false;
  if (isAdminClientSafe(userId)) return true;
  if (PUBLIC_HENRY_USER_ID && userId === PUBLIC_HENRY_USER_ID) return true;
  return false;
}
