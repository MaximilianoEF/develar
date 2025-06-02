import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosBrowseTableComponent } from './turnos-browse-table.component';

describe('AgnTurnosBrowseTableComponent', () => {
  let component: TurnosBrowseTableComponent;
  let fixture: ComponentFixture<TurnosBrowseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosBrowseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosBrowseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
