import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceDetails } from './advance-details';

describe('AdvanceDetails', () => {
  let component: AdvanceDetails;
  let fixture: ComponentFixture<AdvanceDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvanceDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
