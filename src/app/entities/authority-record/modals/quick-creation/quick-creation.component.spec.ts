import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCreationComponent } from './quick-creation.component';

describe('QuickCreationComponent', () => {
  let component: QuickCreationComponent;
  let fixture: ComponentFixture<QuickCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
