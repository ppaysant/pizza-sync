export interface IUserWithoutId {
  username: string;
  nbConnections: number;
  thumbnail: string;
  isOnline: boolean;
}

export interface IUserWithId extends IUserWithoutId {
  id: string;
}
