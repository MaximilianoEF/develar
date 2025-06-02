import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosCreateComponent } from './turnos-create.component';

describe('TurnosCreateComponent', () => {
  let component: TurnosCreateComponent;
  let fixture: ComponentFixture<TurnosCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnosCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
