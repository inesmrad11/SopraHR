import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestFormComponent } from './advance-request-form.component';

describe('AdvanceRequestFormComponent', () => {
  let component: AdvanceRequestFormComponent;
  let fixture: ComponentFixture<AdvanceRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvanceRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
