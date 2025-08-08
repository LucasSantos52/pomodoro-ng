import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { LucideIconsModule } from '../../modules/lucide-icons.module';
import { ModalComponent } from '../modal-info/modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideIconsModule, ModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  DarkTheme: boolean = true;
  isModalOpen: boolean = false;

  constructor(private themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.DarkTheme = !this.DarkTheme;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
