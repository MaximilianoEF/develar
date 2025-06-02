import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestRootfolderBaseComponent } from './ingest-rootfolder-base.component';

describe('IngestaAssetsComponent', () => {
  let component: IngestRootfolderBaseComponent;
  let fixture: ComponentFixture<IngestRootfolderBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngestRootfolderBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestRootfolderBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
