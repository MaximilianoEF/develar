import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdsFormdataModalComponent } from './uds-formdata-modal.component';

describe('UdsFormdataModalComponent', () => {
  let component: UdsFormdataModalComponent;
  let fixture: ComponentFixture<UdsFormdataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdsFormdataModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdsFormdataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
