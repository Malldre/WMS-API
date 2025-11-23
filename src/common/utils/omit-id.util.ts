/**
 * Omits the integer 'id' field from database records
 * Only exposes UUID as the public-facing identifier
 */
export function omitId<T extends { id?: number }>(record: T): Omit<T, 'id'> {
  if (!record) return record;

  const { id, ...rest } = record;
  return rest as Omit<T, 'id'>;
}

/**
 * Omits the integer 'id' field from an array of database records
 */
export function omitIdFromArray<T extends { id?: number }>(records: T[]): Omit<T, 'id'>[] {
  return records.map(record => omitId(record));
}

/**
 * Omits only the internal 'id' field from a record
 * Keeps all foreign keys (invoiceId, materialId, etc.) for API use
 */
export function omitAllInternalIds<T extends Record<string, any>>(record: T): any {
  if (!record) return record;

  const { id, ...rest } = record;
  return rest;
}

/**
 * Omits all internal ID fields from an array of records
 */
export function omitAllInternalIdsFromArray<T extends Record<string, any>>(records: T[]): any[] {
  return records.map(record => omitAllInternalIds(record));
}