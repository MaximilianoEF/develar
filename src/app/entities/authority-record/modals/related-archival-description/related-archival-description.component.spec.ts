import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedArchivalDescriptionComponent } from './related-archival-description.component';

describe('RelatedArchivalDescriptionComponent', () => {
  let component: RelatedArchivalDescriptionComponent;
  let fixture: ComponentFixture<RelatedArchivalDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedArchivalDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedArchivalDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
