import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTurnoFactoryComponent } from './slot-turno-factory.component';

describe('SlotTurnoFactoryComponent', () => {
  let component: SlotTurnoFactoryComponent;
  let fixture: ComponentFixture<SlotTurnoFactoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotTurnoFactoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotTurnoFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
