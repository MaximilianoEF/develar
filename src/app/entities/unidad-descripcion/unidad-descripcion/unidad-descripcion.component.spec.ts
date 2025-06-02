import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDescripcionComponent } from './unidad-descripcion.component';

describe('UnidadDescripcionComponent', () => {
  let component: UnidadDescripcionComponent;
  let fixture: ComponentFixture<UnidadDescripcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnidadDescripcionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadDescripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
