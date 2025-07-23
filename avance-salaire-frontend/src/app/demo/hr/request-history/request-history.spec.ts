import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestHistory } from './request-history';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { of, throwError } from 'rxjs';

const mockRequests = [
  { id: 1, employeeFullName: 'Alice', requestedAmount: 1000, repaymentMonths: 3, status: 'APPROVED', requestDate: '2024-01-01', approvedByFullName: 'HR1' },
  { id: 2, employeeFullName: 'Bob', requestedAmount: 800, repaymentMonths: 2, status: 'REJECTED', requestDate: '2024-01-02', approvedByFullName: 'HR2' }
];

describe('RequestHistory', () => {
  let component: RequestHistory;
  let fixture: ComponentFixture<RequestHistory>;
  let serviceSpy: jasmine.SpyObj<SalaryAdvanceService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SalaryAdvanceService', ['getRequestHistory', 'exportRequestHistoryExcel', 'exportRequestHistoryPdf']);
    await TestBed.configureTestingModule({
      imports: [RequestHistory],
      providers: [{ provide: SalaryAdvanceService, useValue: serviceSpy }]
    }).compileComponents();
    fixture = TestBed.createComponent(RequestHistory);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on init', () => {
    serviceSpy.getRequestHistory.and.returnValue(of({ items: mockRequests, total: 2 }));
    fixture.detectChanges();
    expect(component.requests.length).toBe(2);
    expect(component.total).toBe(2);
  });

  it('should handle error on load', () => {
    serviceSpy.getRequestHistory.and.returnValue(throwError(() => new Error('Erreur')));
    fixture.detectChanges();
    expect(component.error).toContain('Erreur');
  });

  it('should export Excel', () => {
    serviceSpy.getRequestHistory.and.returnValue(of({ items: mockRequests, total: 2 }));
    serviceSpy.exportRequestHistoryExcel.and.returnValue(of(new Blob(['test'])));
    spyOn(component as any, 'saveFile');
    fixture.detectChanges();
    component.onExportExcel();
    expect((component as any).saveFile).toHaveBeenCalled();
  });

  it('should export PDF', () => {
    serviceSpy.getRequestHistory.and.returnValue(of({ items: mockRequests, total: 2 }));
    serviceSpy.exportRequestHistoryPdf.and.returnValue(of(new Blob(['test'])));
    spyOn(component as any, 'saveFile');
    fixture.detectChanges();
    component.onExportPdf();
    expect((component as any).saveFile).toHaveBeenCalled();
  });

  it('should change page', () => {
    serviceSpy.getRequestHistory.and.returnValue(of({ items: mockRequests, total: 2 }));
    fixture.detectChanges();
    component.onPageChange(2);
    expect(component.page).toBe(2);
  });
});
