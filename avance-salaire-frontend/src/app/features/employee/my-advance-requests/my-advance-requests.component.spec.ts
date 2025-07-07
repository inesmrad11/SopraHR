import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAdvanceRequestsComponent } from './my-advance-requests.component';

describe('MyAdvanceRequestsComponent', () => {
  let component: MyAdvanceRequestsComponent;
  let fixture: ComponentFixture<MyAdvanceRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAdvanceRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAdvanceRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
