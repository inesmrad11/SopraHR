import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestDetailsComponent } from './advance-request-details.component';

describe('AdvanceRequestDetailsComponent', () => {
  let component: AdvanceRequestDetailsComponent;
  let fixture: ComponentFixture<AdvanceRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvanceRequestDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
