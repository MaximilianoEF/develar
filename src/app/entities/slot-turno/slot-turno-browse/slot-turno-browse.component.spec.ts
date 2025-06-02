import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTurnoBrowseComponent } from './slot-turno-browse.component';

describe('SlotTurnoBrowseComponent', () => {
  let component: SlotTurnoBrowseComponent;
  let fixture: ComponentFixture<SlotTurnoBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotTurnoBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotTurnoBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
