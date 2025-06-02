import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestRootfolderPanelComponent } from './ingest-rootfolder-panel.component';

describe('IngestaCarpetaContenedoraComponent', () => {
  let component: IngestRootfolderPanelComponent;
  let fixture: ComponentFixture<IngestRootfolderPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngestRootfolderPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestRootfolderPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
