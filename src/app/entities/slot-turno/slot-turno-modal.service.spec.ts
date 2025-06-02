import { TestBed } from '@angular/core/testing';

import { SlotTurnoModalService } from './slot-turno-modal.service';

describe('SlotTurnoModalService', () => {
  let service: SlotTurnoModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotTurnoModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
