import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosBrowseComponent } from './turnos-browse.component';

describe('AgnTurnosBrowseComponent', () => {
  let component: TurnosBrowseComponent;
  let fixture: ComponentFixture<TurnosBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
