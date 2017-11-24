type TypeWithId<T> = T & { id: string };

export abstract class NormalizedModel<TypeWithoutId> {
  private id = 0;
  protected byId: { [key: string]: TypeWithId<TypeWithoutId> } = {};
  protected allIds: string[] = [];

  constructor(private idPrefix: string) {}

  private getNewId() {
    return `${this.idPrefix}${this.id++}`;
  }

  create(element: TypeWithoutId): TypeWithId<TypeWithoutId> {
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

    this.allIds = this.allIds.filter(_id => _id !== id);
    return true;
  }

  setNormalizedData({
    byId,
    allIds,
  }: {
    byId: { [key: string]: TypeWithId<TypeWithoutId> };
    allIds: string[];
  }) {
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

// export abstract class NormalizedModelIndexedByUsername<
//   TypeWithoutId extends { username: string }
// > extends NormalizedModel<TypeWithoutId> {
//   // sometimes we need to track a resource by name
//   // and it's more efficient to use a map rather than
//   // looping through the array to find one resource
//   protected byUsername: Map<string, TypeWithId<TypeWithoutId>> = new Map();

//   create(element: TypeWithoutId): TypeWithId<TypeWithoutId> {
//     const elementWithId = super.create(element);
//     this.byUsername.set(element.username, elementWithId);
//     return elementWithId;
//   }

//   delete(id: string): boolean {
//     if (!super.delete(id)) {
//       return false;
//     }

//     this.byUsername.delete(id);
//     return true;
//   }

//   setNormalizedData({
//     byId,
//     allIds,
//   }: {
//     byId: { [key: string]: TypeWithId<TypeWithoutId> };
//     allIds: string[];
//   }) {
//     super.setNormalizedData({ byId, allIds });
//     this.buildByNameIndex(byId, allIds);
//   }

//   private buildByNameIndex(
//     byId: { [key: string]: TypeWithId<TypeWithoutId> },
//     allIds: string[]
//   ): void {
//     this.byUsername.clear();

//     allIds
//       .map(id => byId[id])
//       .forEach(element => this.byUsername.set(element.username, element));
//   }
// }
