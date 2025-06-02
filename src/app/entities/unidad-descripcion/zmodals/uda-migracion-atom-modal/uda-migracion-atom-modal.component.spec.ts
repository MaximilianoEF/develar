import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdaMigracionAtomModalComponent } from './uda-migracion-atom-modal.component';

describe('UdaMigracionAtomModalComponent', () => {
  let component: UdaMigracionAtomModalComponent;
  let fixture: ComponentFixture<UdaMigracionAtomModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdaMigracionAtomModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdaMigracionAtomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
