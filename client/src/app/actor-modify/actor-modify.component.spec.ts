import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorModifyComponent } from './actor-modify.component';

describe('ActorModifyComponent', () => {
  let component: ActorModifyComponent;
  let fixture: ComponentFixture<ActorModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActorModifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
