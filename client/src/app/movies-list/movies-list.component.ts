/*  _____ _______         _                      _
 * |_   _|__   __|       | |                    | |
 *   | |    | |_ __   ___| |___      _____  _ __| | __  ___ ____
 *   | |    | | '_ \ / _ \ __\ \ /\ / / _ \| '__| |/ / / __|_  /
 *  _| |_   | | | | |  __/ |_ \ V  V / (_) | |  |   < | (__ / /
 * |_____|  |_|_| |_|\___|\__| \_/\_/ \___/|_|  |_|\_(_)___/___|
 *                                _
 *              ___ ___ ___ _____|_|_ _ _____
 *             | . |  _| -_|     | | | |     |  LICENCE
 *             |  _|_| |___|_|_|_|_|___|_|_|_|
 *             |_|
 *
 *   PROGRAMOVÁNÍ  <>  DESIGN  <>  PRÁCE/PODNIKÁNÍ  <>  HW A SW
 *
 * Tento zdrojový kód je součástí výukových seriálů na
 * IT sociální síti WWW.ITNETWORK.CZ
 *
 * Kód spadá pod licenci prémiového obsahu a vznikl díky podpoře
 * našich členů. Je určen pouze pro osobní užití a nesmí být šířen.
 * Více informací na http://www.itnetwork.cz/licence
 */

import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MoviesService} from '../services/movies.service';
import {Movie} from '../services/models/movie.model';
import {MovieFilterComponent} from "../components/movie-filter/movie-filter.component";
import {Person} from "../services/models/person.model";
import {ActorsService} from "../services/actors.service";
import {MovieModifyComponent} from "../movie-modify/movie-modify.component";

@Component({
  selector: 'app-movies-list',
  templateUrl: './movies-list.component.html',
  styleUrls: ['./movies-list.component.css']
})
export class MoviesListComponent implements AfterViewInit {

  @ViewChild(MovieFilterComponent, {static: false})
  private movieFilterRef!: MovieFilterComponent;

  public selectedMovie: Movie | null = null; // 30/11 public

  public selectedMovieActors: string[] = []; // 30/11 public
  public selectedMovieDirector: string | null = null; // 30/11 public

  public isDetailModalClosed: boolean = true; // 30/11 public

  public isEditModalClosed: boolean = true; // 30/11 public

  @ViewChild(MovieModifyComponent, {static: false})
  private movieEditRef!: MovieModifyComponent;

  movies: Array<Movie> = [];

  constructor(
    private readonly moviesService: MoviesService,
    private readonly actorsService: ActorsService // 30/11 pridat
  ) { }

  ngAfterViewInit(): void {
    this.filter();
  }

  public removeMovie() {// 30/11 public
    if (this.selectedMovie == null) return // 30/11 pridano

    if (confirm('Opravdu chcete odebrat tento film?')) {
      this.moviesService.removeMovie(this.selectedMovie)
        .subscribe((data) => {
          this.filter();
        });
    }
  }

  public editMovie() {  // 30/11 public
    if (this.selectedMovie == null) return; // 30/11 pridano

    if (this.movieEditRef.formRef.form.valid) {
      this.moviesService.editMovie(this.selectedMovie)
        .subscribe((result) => {
          this.isEditModalClosed = true;
          this.selectedMovie = null;
          this.filter();
        }, (error) => {
          alert(`Chyba: ${error.toLocaleString()}`);
        });
    }
  }

  public showDetail() {  // 30/11 public
    if (this.selectedMovie == null) return // 30/11 pridano

    this.actorsService.getPerson(this.selectedMovie.directorID).subscribe((data: Person) => {
      this.selectedMovieDirector = data.name;
    });

    this.selectedMovieActors = [];
    this.selectedMovie.actorIDs.forEach((item) => {
      this.actorsService.getPerson(item).subscribe((data: Person) => {
        this.selectedMovieActors.push(data.name);
      });
    });

    this.isDetailModalClosed = false;
  }

  filter() {
    const movieFilter = this.movieFilterRef.movieFilter; // Zde získáme filter model
    this.moviesService.getMovies(movieFilter)
      .subscribe(
        (movies: Array<Movie>) => this.movies = movies, // Podobné `then` metodě
        (error) => console.log(error), // Podobné `catch()` metodě
        () => {} // Krajně podobné `complete()` metodě. Tato funkce tady ani nemusí být, jelikož je prázdná.
      );
  }

}
