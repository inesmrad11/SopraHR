import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrStatistics } from './hr-statistics';

describe('HrStatistics', () => {
  let component: HrStatistics;
  let fixture: ComponentFixture<HrStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrStatistics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrStatistics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
