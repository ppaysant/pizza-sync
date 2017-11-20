export abstract class NormalizedModel<
  TypeWithoutId,
  TypeWithId = TypeWithoutId & { id: string }
> {
  private id = 0;
  protected byId: { [key: string]: TypeWithId } = {};
  protected allIds: string[] = [];

  constructor(private idPrefix: string) {}

  // TODO: should be private
  protected getNewId() {
    return `${this.idPrefix}${this.id++}`;
  }

  create(element: TypeWithoutId): TypeWithId {
    const newId = this.getNewId();

    // `as any` syntax is a way to avoid the error of using
    // spread operator on a variable with a generic type
    this.byId[newId] = { ...(element as any), id: newId };

    this.allIds.push(newId);
    return this.byId[newId];
  }

  delete(id: string): boolean {
    if (!this.byId[id]) {
      return false;
    }

    delete this.byId[id];

    this.allIds = this.allIds.filter(idTmp => idTmp !== id);
    return true;
  }

  setNormalizedData({ byId, allIds }) {
    this.byId = byId;
    this.allIds = allIds;
  }

  getNormalizedData() {
    return {
      byId: this.byId,
      allIds: this.allIds,
    };
  }
}
