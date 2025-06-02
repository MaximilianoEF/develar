import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTurnoPageComponent } from './slot-turno-page.component';

describe('SlotTurnoPageComponent', () => {
  let component: SlotTurnoPageComponent;
  let fixture: ComponentFixture<SlotTurnoPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotTurnoPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotTurnoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
