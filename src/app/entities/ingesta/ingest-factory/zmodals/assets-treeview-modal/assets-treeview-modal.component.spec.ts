import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsTreeviewModalComponent } from './assets-treeview-modal.component';

describe('IngestaCarpetaContenedoraModalArbolComponent', () => {
  let component: AssetsTreeviewModalComponent;
  let fixture: ComponentFixture<AssetsTreeviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsTreeviewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsTreeviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
