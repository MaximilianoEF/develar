import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosDialogConfirmationComponent } from './turnos-dialog-confirmation.component';

describe('AgnTurnosDialogConfirmationComponent', () => {
  let component: TurnosDialogConfirmationComponent;
  let fixture: ComponentFixture<TurnosDialogConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosDialogConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosDialogConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
