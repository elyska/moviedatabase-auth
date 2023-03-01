export class Movie {
  public _id: string | null = null;

  constructor(
    public name: string,
    public directorID: string,
    public actorIDs: string[],
    public isAvailable: boolean,
    public genres: string[],
    public year: number
  ) {}
  static createEmpty() {
    return new Movie('', '', [], false, [], 0);
  }
}
