import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDescripcionBrowseComponent } from './unidad-descripcion-browse.component';

describe('UnidadDescripcionBrowseComponent', () => {
  let component: UnidadDescripcionBrowseComponent;
  let fixture: ComponentFixture<UnidadDescripcionBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnidadDescripcionBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadDescripcionBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
