import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminoTableComponent } from './termino-table.component';

describe('TerminoTableComponent', () => {
  let component: TerminoTableComponent;
  let fixture: ComponentFixture<TerminoTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminoTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
