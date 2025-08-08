import { Component, EventEmitter, Output  } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-info',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
 @Output() close = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close.emit();
    }
  }

  closeModal() {
    this.close.emit();
  }
}
