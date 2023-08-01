import { AggOption } from './aggOption';

export interface Agg {
  name: string;
  displayName: string;
  options?: Array<AggOption>;
}
