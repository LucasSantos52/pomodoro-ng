// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      this.setTheme(saved);
    } else {
      this.setTheme('light');
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }
}
