/**
 * Ids are generated client-side only while the localStorage adapter is the
 * store. Once the backend exists Mongo issues them and this is unused for
 * notes — it stays for anything genuinely client-local.
 */
export function createId(): string {
  return crypto.randomUUID()
}
