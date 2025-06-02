import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDescripcionBrowseTableComponent } from './unidad-descripcion-browse-table.component';

describe('UnidadDescripcionBrowseTableComponent', () => {
  let component: UnidadDescripcionBrowseTableComponent;
  let fixture: ComponentFixture<UnidadDescripcionBrowseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnidadDescripcionBrowseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadDescripcionBrowseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
