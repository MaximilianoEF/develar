import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTurnoEditComponent } from './slot-turno-edit.component';

describe('SlotTurnoEditComponent', () => {
  let component: SlotTurnoEditComponent;
  let fixture: ComponentFixture<SlotTurnoEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotTurnoEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotTurnoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
