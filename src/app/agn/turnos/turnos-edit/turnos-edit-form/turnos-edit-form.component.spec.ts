import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosEditFormComponent } from './turnos-edit-form.component';

describe('AgnTurnosEditFormComponent', () => {
  let component: TurnosEditFormComponent;
  let fixture: ComponentFixture<TurnosEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
