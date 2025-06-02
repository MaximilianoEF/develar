import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosDashboardComponent } from './turnos-dashboard.component';

describe('AgnTurnosDashboardComponent', () => {
  let component: TurnosDashboardComponent;
  let fixture: ComponentFixture<TurnosDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
