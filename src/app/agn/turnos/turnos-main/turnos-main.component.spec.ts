import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosMainComponent } from './turnos-main.component';

describe('TurnosMainComponent', () => {
  let component: TurnosMainComponent;
  let fixture: ComponentFixture<TurnosMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
