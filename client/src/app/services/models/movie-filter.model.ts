export class MovieFilter {
  directorID: string | null = null;
  actorID: string | null = null;
  genre: string | null = null;
  fromYear: number | null = null;
  toYear: number | null = null;
  limit = 10;
}
