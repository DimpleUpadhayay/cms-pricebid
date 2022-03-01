import { TestBed, inject } from '@angular/core/testing';

import { EmdService } from './emd.service';

describe('EmdService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmdService]
    });
  });

  it('should be created', inject([EmdService], (service: EmdService) => {
    expect(service).toBeTruthy();
  }));
});
