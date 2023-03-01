import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActorFilter} from "../../services/models/actor-filter.model";
import {ActorsService} from "../../services/actors.service";

@Component({
  selector: 'app-actors-filter',
  templateUrl: './actors-filter.component.html',
  styleUrls: ['./actors-filter.component.css']
})
export class ActorsFilterComponent implements OnInit {

  actorFilter = new ActorFilter();

  @Output()
  public onFilter: EventEmitter<void> = new EventEmitter<void>();

  constructor(private actorsService: ActorsService) { }

  public get roles() {
    return this.actorsService.roles;
  }

  ngOnInit() : void {
    this.actorFilter.role = this.roles[0].key;
  }

}
