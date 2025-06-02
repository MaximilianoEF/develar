import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMetadataModalComponent } from './asset-metadata-modal.component';

describe('AssetMetadataModalComponent', () => {
  let component: AssetMetadataModalComponent;
  let fixture: ComponentFixture<AssetMetadataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMetadataModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMetadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
