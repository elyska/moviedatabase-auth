import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MoviesService} from "../services/movies.service";
import {ActorsService} from "../services/actors.service";
import {Person} from "../services/models/person.model";
import {NgForm} from "@angular/forms";
import {Movie} from "../services/models/movie.model";

@Component({
  selector: 'app-movie-modify',
  templateUrl: './movie-modify.component.html',
  styleUrls: ['./movie-modify.component.css']
})
export class MovieModifyComponent implements OnInit {

  @Input()
  movie: Movie | null = Movie.createEmpty();

  @ViewChild(NgForm, {static: false})
  formRef!: NgForm;

  public actors!: Person[];
  public directors!: Person[];
  public genres!: string[];

  constructor(private moviesService: MoviesService, private actorsService: ActorsService) { }

  get valid() {
    return this.formRef.valid;
  }

  ngOnInit() {
    this.actorsService.getActors({role: "actor", limit: null}).subscribe((data: Array<Person>) => {
      this.actors = data;
    });
    this.actorsService.getDirectors({role: "director", limit: null}).subscribe((data: Array<Person>) => {
      this.directors = data;
    });
    this.moviesService.getGenres().subscribe((data: Array<string>) => {
      this.genres = data;
    });
  }
}
