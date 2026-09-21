export type MascotState = 'waiting' | 'joy' | 'encourage' | 'talking' | 'sleeping';

export interface MascotProps {
  state?: MascotState;
  /** 0–1, hlasitost z AnalyserNode. Řídí otevření pusy při mluvení. */
  mouth?: number;
  className?: string;
}
