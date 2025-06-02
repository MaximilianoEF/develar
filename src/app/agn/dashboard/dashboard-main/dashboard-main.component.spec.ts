import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgnDashboardMainComponent } from './agn-dashboard-main.component';

describe('AgnDashboardMainComponent', () => {
  let component: AgnDashboardMainComponent;
  let fixture: ComponentFixture<AgnDashboardMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgnDashboardMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgnDashboardMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
