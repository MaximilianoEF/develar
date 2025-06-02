import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDescripcionHistoryComponent } from './unidad-descripcion-history.component';

describe('UnidadDescripcionHistoryComponent', () => {
  let component: UnidadDescripcionHistoryComponent;
  let fixture: ComponentFixture<UnidadDescripcionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnidadDescripcionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadDescripcionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
