import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTurnoBrowseTableComponent } from './slot-turno-browse-table.component';

describe('SlotTurnoBrowseTableComponent', () => {
  let component: SlotTurnoBrowseTableComponent;
  let fixture: ComponentFixture<SlotTurnoBrowseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotTurnoBrowseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotTurnoBrowseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
