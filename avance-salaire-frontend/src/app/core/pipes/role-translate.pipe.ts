import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTranslate',
  standalone: true
})
export class RoleTranslatePipe implements PipeTransform {
  transform(role: string): string {
    switch (role) {
      case 'EMPLOYEE':
        return 'Employé(e)';
      case 'HR_EXPERT':
        return 'Expert RH';
      default:
        return role;
    }
  }
} 