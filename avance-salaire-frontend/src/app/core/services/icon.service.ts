import { Injectable } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private icons: Map<string, IconDefinition> = new Map();

  registerIcon(...icons: IconDefinition[]): void {
    icons.forEach(icon => {
      this.icons.set(icon.name, icon);
    });
  }

  getIcon(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  getAllIcons(): IconDefinition[] {
    return Array.from(this.icons.values());
  }
} 