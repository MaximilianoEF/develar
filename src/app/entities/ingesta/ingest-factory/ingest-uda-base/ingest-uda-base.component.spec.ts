import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestUdaBaseComponent } from './ingest-uda-base.component';

describe('IngestaUnidadDocumentalMatchingComponent', () => {
  let component: IngestUdaBaseComponent;
  let fixture: ComponentFixture<IngestUdaBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngestUdaBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestUdaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
