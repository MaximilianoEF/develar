import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdaPanelComponent } from './uda-panel.component';

describe('UdaPanelComponent', () => {
  let component: UdaPanelComponent;
  let fixture: ComponentFixture<UdaPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdaPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdaPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
