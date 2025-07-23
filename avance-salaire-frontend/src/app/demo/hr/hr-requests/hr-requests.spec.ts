import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HrRequests } from './hr-requests';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { of } from 'rxjs';
import { RequestStatus } from '../../../core/models/request-status.enum';

describe('HrRequests', () => {
  let component: HrRequests;
  let fixture: ComponentFixture<HrRequests>;
  let serviceSpy: jasmine.SpyObj<SalaryAdvanceService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SalaryAdvanceService', ['getAllRequests']);
    await TestBed.configureTestingModule({
      imports: [HrRequests],
      providers: [{ provide: SalaryAdvanceService, useValue: serviceSpy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests', () => {
    serviceSpy.getAllRequests.and.returnValue(of([
      { id: 1, employeeFullName: 'Test', requestDate: '2024-01-01', requestedAmount: 100, repaymentMonths: 2, status: RequestStatus.PENDING, reason: '', neededDate: '', createdAt: '', updatedAt: '' }
    ]));
    component.fetchRequests();
    expect(component.requests.length).toBe(1);
    expect(component.requests[0].employeeFullName).toBe('Test');
  });

  it('should filter by employee name', () => {
    component.requests = [
      { id: 1, employeeFullName: 'Alice', requestDate: '2024-01-01', requestedAmount: 100, repaymentMonths: 2, status: RequestStatus.PENDING, reason: '', neededDate: '', createdAt: '', updatedAt: '' },
      { id: 2, employeeFullName: 'Bob', requestDate: '2024-01-01', requestedAmount: 200, repaymentMonths: 3, status: RequestStatus.APPROVED, reason: '', neededDate: '', createdAt: '', updatedAt: '' }
    ];
    component.filterName = 'bob';
    expect(component.filteredRequests.length).toBe(1);
    expect(component.filteredRequests[0].employeeFullName).toBe('Bob');
  });

  it('should open modal on approve', () => {
    const req = { id: 1, employeeFullName: 'Test', requestDate: '2024-01-01', requestedAmount: 100, repaymentMonths: 2, status: RequestStatus.PENDING, reason: '', neededDate: '', createdAt: '', updatedAt: '' };
    component.onApprove(req);
    expect(component.modalVisible).toBeTrue();
    expect(component.modalAction).toBe('approve');
    expect(component.modalRequest).toBe(req);
  });

  it('should open modal on reject', () => {
    const req = { id: 1, employeeFullName: 'Test', requestDate: '2024-01-01', requestedAmount: 100, repaymentMonths: 2, status: RequestStatus.PENDING, reason: '', neededDate: '', createdAt: '', updatedAt: '' };
    component.onReject(req);
    expect(component.modalVisible).toBeTrue();
    expect(component.modalAction).toBe('reject');
    expect(component.modalRequest).toBe(req);
  });
});
