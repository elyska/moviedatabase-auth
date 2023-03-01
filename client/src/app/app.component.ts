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

import {Component, ViewChild} from '@angular/core';
import {ActorModifyComponent} from "./actor-modify/actor-modify.component";
import {ActorsService} from "./services/actors.service";
import {Router} from "@angular/router";
import {MovieModifyComponent} from "./movie-modify/movie-modify.component";
import {MoviesService} from "./services/movies.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';

  public isActorModalClosed = true;
  public isMovieModalClosed = true;

  @ViewChild(ActorModifyComponent, {static: false})
  actorAddRef!: ActorModifyComponent;

  @ViewChild(MovieModifyComponent, {static: false})
  movieAddRef!: MovieModifyComponent;

  constructor(
    private actorsService: ActorsService,
    private moviesService: MoviesService,
    private router: Router
  ) { }

  public addMovie() {
    if (this.movieAddRef.movie != null && this.movieAddRef.valid) {
      this.moviesService.addMovie(this.movieAddRef.movie)
        .subscribe((response) => {
          this.router.onSameUrlNavigation = 'reload';
          this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
          }
          this.actorAddRef.formRef.resetForm();
          this.isMovieModalClosed = true;
          this.router.navigate(['/movies-list']);
        }, (error) => {
          alert('Chyba: ' + error.toString());
        });
    }
  }

  public addActor() {
    if (this.actorAddRef.valid) {
      this.actorsService.addPerson(this.actorAddRef.actor)
        .subscribe(
          (response) => {
            this.router.onSameUrlNavigation = 'reload'; //Vynutí angular zavolat ngAfterViewInit
            this.router.routeReuseStrategy.shouldReuseRoute = function () { //Vynutí angular zavolat ngAfterViewInit
              return false;
            }
            this.actorAddRef.formRef.resetForm(); //Reset formuláře
            this.isActorModalClosed = true;
            this.router.navigate(['/actors-list']);
          }, (error) => {
            alert('Chyba: ' + error.toLocaleString());
          }
        );
    }
  }
}
