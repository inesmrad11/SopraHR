import { Component } from '@angular/core';
import { SnakeTimelineComponent, RequestActivity } from 'src/app/shared/components/request-activity-timeline.component';

@Component({
  selector: 'app-advance-details',
  standalone: true,
  imports: [SnakeTimelineComponent],
  templateUrl: './advance-details.html',
  styleUrl: './advance-details.scss'
})
export class AdvanceDetails {
  mockActivities: RequestActivity[] = [
    {
      type: 'SUBMISSION',
      status: 'pending',
      actor: 'John Doe',
      actorRole: 'Employé',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      comment: 'Demande initiale d’avance sur salaire.'
    },
    {
      type: 'COMMENT',
      status: 'pending',
      actor: 'John Doe',
      actorRole: 'Employé',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
      comment: 'Merci de traiter rapidement.'
    },
    {
      type: 'VALIDATION',
      status: 'approved',
      actor: 'Expert RH',
      actorRole: 'RH',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      comment: 'Demande validée.'
    },
    {
      type: 'PAYMENT',
      status: 'approved',
      actor: 'Comptabilité',
      actorRole: 'Service Paie',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      details: 'Virement effectué sur le compte bancaire.'
    },
    {
      type: 'CLOSURE',
      status: 'approved',
      actor: 'Système',
      timestamp: new Date().toISOString(),
      details: 'Demande clôturée automatiquement après remboursement.'
    }
  ];
}
