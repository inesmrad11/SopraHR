import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestListComponent } from './advance-request-list.component';

describe('AdvanceRequestListComponent', () => {
  let component: AdvanceRequestListComponent;
  let fixture: ComponentFixture<AdvanceRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvanceRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
