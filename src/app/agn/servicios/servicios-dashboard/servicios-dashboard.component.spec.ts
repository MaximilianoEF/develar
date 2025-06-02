import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosDashboardComponent } from './servicios-dashboard.component';

describe('ServiciosDashboardComponent', () => {
  let component: ServiciosDashboardComponent;
  let fixture: ComponentFixture<ServiciosDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiciosDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciosDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
