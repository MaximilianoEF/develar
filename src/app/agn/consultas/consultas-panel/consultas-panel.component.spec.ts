import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasPanelComponent } from './consultas-panel.component';

describe('ConsultasPanelComponent', () => {
  let component: ConsultasPanelComponent;
  let fixture: ComponentFixture<ConsultasPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultasPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
