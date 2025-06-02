import { TestBed } from '@angular/core/testing';

import { UnloggedInterceptorService } from './unlogged-interceptor.service';

describe('UnloggedInterceptorService', () => {
  let service: UnloggedInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnloggedInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
