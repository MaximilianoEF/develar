import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgnComponent } from './agn.component';

describe('AgnComponent', () => {
  let component: AgnComponent;
  let fixture: ComponentFixture<AgnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
