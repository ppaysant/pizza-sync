export function normalizeArray(
  arr: { id: string }[]
): { byId: {}; allIds: string[] } {
  if (!arr) {
    return { byId: {}, allIds: [] };
  }

  return arr.reduce(
    (acc, next) => {
      acc.byId[next.id] = next;
      acc.allIds.push(next.id);

      return acc;
    },
    { byId: {}, allIds: [] }
  );
}
