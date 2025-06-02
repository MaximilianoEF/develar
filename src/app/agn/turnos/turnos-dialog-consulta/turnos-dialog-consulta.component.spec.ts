import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosDialogConsultaComponent } from './turnos-dialog-consulta.component';

describe('AgnTurnosDialogConsultaComponent', () => {
  let component: TurnosDialogConsultaComponent;
  let fixture: ComponentFixture<TurnosDialogConsultaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosDialogConsultaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosDialogConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
