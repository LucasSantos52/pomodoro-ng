import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<'light' | 'dark'>('light');

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    this.setTheme(saved ?? 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    this.theme$.next(theme);
  }

  toggleTheme() {
    const next = this.theme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  getCurrentTheme() {
    return this.theme$.asObservable(); // para quem quiser se inscrever
  }

  getThemeValue() {
    return this.theme$.value; // valor atual (sincrônico)
  }
}
