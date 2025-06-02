import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosEditComponent } from './turnos-edit.component';

describe('AgnTurnosEditComponent', () => {
  let component: TurnosEditComponent;
  let fixture: ComponentFixture<TurnosEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
