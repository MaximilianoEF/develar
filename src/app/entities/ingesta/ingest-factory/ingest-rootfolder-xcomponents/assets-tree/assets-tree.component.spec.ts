import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsTreeComponent } from './assets-tree.component';

describe('AssetsTreeComponent', () => {
  let component: AssetsTreeComponent;
  let fixture: ComponentFixture<AssetsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
