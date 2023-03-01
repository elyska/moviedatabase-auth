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
import {ActorsService} from "../services/actors.service";
import {Person} from "../services/models/person.model";
import {ActorsFilterComponent} from "../components/actors-filter/actors-filter.component";
import {ActorModifyComponent} from "../actor-modify/actor-modify.component";

@Component({
  selector: 'app-actors-list',
  templateUrl: './actors-list.component.html',
  styleUrls: ['./actors-list.component.css']
})

export class ActorsListComponent implements AfterViewInit {

  public people: Array<Person> = [];

  public selectedPerson: Person | null = null;

  public isDetailModalClosed = true;
  public isEditModalClosed = true;

  @ViewChild(ActorsFilterComponent, {static: false})
  private actorsFilterRef!: ActorsFilterComponent;

  constructor(private actorsService: ActorsService) {
  }

  ngAfterViewInit(): void {
    this.filter();
  }

  @ViewChild(ActorModifyComponent, {static: false})
  private actorEditRef!: ActorModifyComponent;

  public editPerson() {
    if (this.actorEditRef.formRef.form.valid && this.selectedPerson != null) {
      this.actorsService.editPerson(this.selectedPerson)
        .subscribe((result) => {
          this.isEditModalClosed = true;
          this.selectedPerson = null;
          this.filter();
        }, (error) => {
          console.log(error);
          alert(`Chyba: ${error.toLocaleString()}`);
        });
    }
  }

  public removePerson() {
    if (confirm('Opravdu chcete odebrat tuto osobu?') && this.selectedPerson != null) {
      this.actorsService.removePerson(this.selectedPerson)
        .subscribe((result) => {
          this.filter();
        });
    }
  }

  public filter() {
    if (this.actorsFilterRef.actorFilter.role === 'actor') {
      this.actorsService.getActors(this.actorsFilterRef.actorFilter).subscribe((data: Array<Person>) => {
        this.people = data;
      });
    } else {
      this.actorsService.getDirectors(this.actorsFilterRef.actorFilter).subscribe((data: Array<Person>) => {
        this.people = data;
      });
    }
  }

}
