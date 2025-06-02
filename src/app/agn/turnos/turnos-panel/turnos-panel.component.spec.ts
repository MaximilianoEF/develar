import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosPanelComponent } from './turnos-panel.component';

describe('TurnosPanelComponent', () => {
  let component: TurnosPanelComponent;
  let fixture: ComponentFixture<TurnosPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
