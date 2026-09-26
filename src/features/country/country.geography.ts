/**
 * A city belongs to a selected region when its direct administrative area is
 * that region or one of its descendants (for example Centre → Mfoundi →
 * Yaoundé). Country Config returns the complete hierarchy in one response.
 */
export function isAdministrativeDescendant(
  areaId: string | null,
  selectedAreaId: string | undefined,
  parents: ReadonlyMap<string, string | null>,
): boolean {
  if (!selectedAreaId) return true;
  let currentId = areaId;
  while (currentId) {
    if (currentId === selectedAreaId) return true;
    currentId = parents.get(currentId) ?? null;
  }
  return false;
}
