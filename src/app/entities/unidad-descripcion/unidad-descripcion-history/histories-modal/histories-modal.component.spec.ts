import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriesModalComponent } from './histories-modal.component';

describe('HistoriesModalComponent', () => {
  let component: HistoriesModalComponent;
  let fixture: ComponentFixture<HistoriesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoriesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoriesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
