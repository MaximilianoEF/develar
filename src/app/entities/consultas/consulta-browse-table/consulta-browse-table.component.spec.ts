import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaBrowseTableComponent } from './consulta-browse-table.component';

describe('ConsultaBrowseTableComponent', () => {
  let component: ConsultaBrowseTableComponent;
  let fixture: ComponentFixture<ConsultaBrowseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaBrowseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaBrowseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
