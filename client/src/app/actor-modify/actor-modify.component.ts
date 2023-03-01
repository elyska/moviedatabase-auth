import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Person} from "../services/models/person.model";
import {NgForm} from "@angular/forms";
import {ActorsService} from "../services/actors.service";

@Component({
  selector: 'app-actor-modify',
  templateUrl: './actor-modify.component.html',
  styleUrls: ['./actor-modify.component.css']
})
export class ActorModifyComponent implements OnInit {

  @Input()
  actor: Person | null = new Person();

  @ViewChild(NgForm, {static: false})
  formRef!: NgForm; // přidáno !

  constructor(private actorsService: ActorsService) { }

  public get roles() {
    return this.actorsService.roles;
  }

  get valid() {
    return this.formRef.form.valid;
  }

  ngOnInit(): void {
  }

}
