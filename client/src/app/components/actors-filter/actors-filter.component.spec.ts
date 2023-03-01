import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorsFilterComponent } from './actors-filter.component';

describe('ActorsFilterComponent', () => {
  let component: ActorsFilterComponent;
  let fixture: ComponentFixture<ActorsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActorsFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
