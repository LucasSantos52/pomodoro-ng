export interface pomodoroConfig {
  name: string;
  concentrationTime: number;
  concentrationTimeSeconds: number,
  pauseTime: number;
  cicles: number;
  longPauseTime: {
    min: number;
    max: number;
  }
}
