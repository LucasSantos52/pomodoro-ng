// shared/lucide-icons.module.ts
import { NgModule } from '@angular/core';
import { LucideAngularModule, Home, Sun, Moon, Play, Pause, Square, Info } from 'lucide-angular';

const icons = {
  Home,
  Sun,
  Moon,
  Play,
  Pause,
  Square,
  Info
};

@NgModule({
  imports: [LucideAngularModule.pick(icons)],
  exports: [LucideAngularModule],
})
export class LucideIconsModule {}
