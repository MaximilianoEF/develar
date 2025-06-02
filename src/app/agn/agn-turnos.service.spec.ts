import { TestBed } from '@angular/core/testing';

import { AgnTurnosService } from './agn-turnos.service';

describe('AgnTurnosService', () => {
  let service: AgnTurnosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgnTurnosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
