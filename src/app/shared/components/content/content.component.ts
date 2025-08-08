import { Component, SimpleChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from '../../modules/lucide-icons.module';
import { pomodoroConfig } from '../../../core/interfaces';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [LucideIconsModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
})
export class ContentComponent implements OnInit {
  initialMinutes: number = 25; // Tempo padrão do Pomodoro
  minutes: number = 0;
  seconds: number = 0;
  currentTimerConfig: { min: number; sec: number }[] = [{ min: 0, sec: 0 }];
  currentStep: number = 0;
  pomodoroTotal: number = 0;

  pomodoroConfig: pomodoroConfig[] = [
    {
      name: 'Clássico (Padrão original)',
      concentrationTime: 25,
      pauseTime: 5,
      cicles: 4,
      longPauseTime: { min: 15, max: 30 },
      concentrationTimeSeconds: 0,
    },
    {
      name: 'teste Rápido',
      concentrationTime: 0,
      pauseTime: 0,
      cicles: 2,
      longPauseTime: { min: 1, max: 10 },
      concentrationTimeSeconds: 3,
    },
    {
      name: 'Sprint Rápido',
      concentrationTime: 15,
      pauseTime: 3,
      cicles: 5,
      longPauseTime: { min: 10, max: 10 },
      concentrationTimeSeconds: 0,
    },
    {
      name: 'Deep Work (Trabalho Profundo)',
      concentrationTime: 50,
      pauseTime: 10,
      cicles: 2,
      longPauseTime: { min: 30, max: 30 },
      concentrationTimeSeconds: 0,
    },
    {
      name: 'Estilo Universitário / Estudo Intensivo',
      concentrationTime: 40,
      pauseTime: 10,
      cicles: 3,
      longPauseTime: { min: 20, max: 30 },
      concentrationTimeSeconds: 0,
    },
    {
      name: 'Pomodoro Leve',
      concentrationTime: 20,
      pauseTime: 5,
      cicles: 4,
      longPauseTime: { min: 10, max: 10 },
      concentrationTimeSeconds: 0,
    },
  ];
  currentConfigName: string = '';
  currentConfig: pomodoroConfig = {} as pomodoroConfig;

  isRunning: boolean = false;
  isCompleted: boolean = false;

  private audioContext: AudioContext | null = null;
  private audioEnabled: boolean = false;
  private intervalId: any = null;

  constructor() {
    this.resetTimer();
  } 

  ngOnInit(): void {
    if (this.pomodoroConfig.length > 0) {
      const pname = this.pomodoroConfig[0].name;
      this.currentConfigName = pname;
      this.applyConfiguration(pname);
    }
  }

  setStep(index: number) {
    this.currentStep = index;
    this.minutes = this.currentTimerConfig[index].min;
    this.seconds = this.currentTimerConfig[index].sec;
  }

  onConfigChange(): void {
    if (this.currentConfigName) {
      console.log('Nova configuração selecionada:', this.currentConfigName);

      this.applyConfiguration(this.currentConfigName);

      // todo: salvar config no localStorage ou no cookie
    }
  }

  private applyConfiguration(config: string): void {
    const selectConfig = this.pomodoroConfig.find(
      (config) => config.name === this.currentConfigName
    );

    if (!selectConfig) return;

    this.currentConfig = selectConfig;
    this.currentTimerConfig = [];

    const arr = Array.from({ length: selectConfig.cicles });
    const timesetConfig: { min: number; sec: number }[] = [];

    arr.forEach((_, idx) => {
      timesetConfig.push({
        min: selectConfig.concentrationTime,
        sec: selectConfig.concentrationTimeSeconds,
      });

      timesetConfig.push(
        idx === arr.length - 1
          ? { min: selectConfig.longPauseTime.min, sec: 0 }
          : { min: selectConfig.pauseTime, sec: 0 }
      );
    });

    this.currentTimerConfig = timesetConfig;
    this.minutes = timesetConfig[0].min;
    this.seconds = timesetConfig[0].sec;
  }

  goToTheNextStep() {
    this.currentStep += 1;
    this.minutes = this.currentTimerConfig[this.currentStep].min;
    this.seconds = this.currentTimerConfig[this.currentStep].sec;
    this.startOrPause();
  }

  // Método público para obter a configuração atual
  getCurrentConfigName(): string | null {
    return this.currentConfigName;
  }

  stringify(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  onTimeEdit(event: Event, field: 'minutes' | 'seconds'): void {
    const el = event.target as HTMLElement;
    let value = el.innerText.replace(/\D/g, ''); // Remove não-dígitos

    value = value.slice(-2);
    let numValue = parseInt(value) || 0;

    if (numValue > 59) {
      numValue = 59;
    }

    this[field] = numValue;
    el.innerText = this.formatTime(numValue);

    // Move cursor para o final
    setTimeout(() => {
      const range = document.createRange();
      const selection = window.getSelection();
      if (selection) {
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  }

  selectContent(event: FocusEvent): void {
    const el = event.target as HTMLElement;
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(el);
    }
  }

  canEdit() {
    if (this.isRunning) return false;

    return true;
  }

  formatTime(time: number): string {
    return time.toString().padStart(2, '0');
  }

  startOrPause() {
    if (!this.audioEnabled) {
      this.initializeAudio();
    }

    this.isRunning ? this.pauseTimer() : this.startTimer();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Testa o áudio com som baixo para "destravar" o navegador
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);

      this.audioEnabled = true;
      // console.log('✅ Áudio habilitado!');
    } catch (error) {
      console.log('❌ Erro ao inicializar áudio:', error);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Limpa o contexto de áudio
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  startTimer() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isCompleted = false;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.minutes = this.currentTimerConfig[0].min;
    this.seconds = this.currentTimerConfig[0].sec;
    this.currentStep = 0;
    this.isCompleted = false;
  }

  private tick() {
    if (this.seconds > 0) {
      this.seconds--;
    } else if (this.minutes > 0) {
      this.minutes--;
      this.seconds = 59;
    } else {
      // Timer finalizado
      this.pauseTimer();
      this.playNotificationSound();

      if (this.currentStep !== this.currentTimerConfig.length - 1) {
        this.goToTheNextStep();
        return;
      }

      this.isCompleted = true;
      this.resetTimer();
      this.pomodoroTotal += 1;

      console.log(this.pomodoroTotal);

    }
  }

  private async playNotificationSound(): Promise<void> {
    if (!this.audioEnabled || !this.audioContext) {
      console.log('⚠️ Clique em Start primeiro para habilitar o áudio!');
      return;
    }

    try {
      const audio = new Audio('assets/sounds/sound.wav');
      audio.volume = 0.7;

      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), {
          once: true,
        });
        audio.addEventListener(
          'error',
          () => reject('Erro ao carregar o áudio'),
          { once: true }
        );
      });

      await audio.play();
    } catch (error) {
      console.log('Som local não encontrado ou falha ao tocar, usando beep...');
      this.playCustomBeep();
    }
  }

  private async playCustomBeep(
    frequency: number = 800,
    duration: number = 1
  ): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Diferentes frequências para diferentes "sons"
    // 440Hz = Lá médio, 800Hz = agudo, 200Hz = grave
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.type = 'sine'; // 'sine', 'square', 'triangle', 'sawtooth'

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.5,
      this.audioContext.currentTime + 0.1
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}
