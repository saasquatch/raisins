import { Node } from 'domhandler';

export type DropState = PossibleDrop;

export type Location = {
  DOM: HTMLElement;
} & ModelLocation;

export type ModelLocation = {
  model: Node;
  idx: number;
  slot: string;
};
export type PossibleDrop = {
  from: Location;
  to: Location;
};

export type TheoreticalDrop = {
  from: Location;
};

export function isTheoretrical(drop: TheoreticalDrop, to: ModelLocation): boolean {
  if (drop.from.model === to.model && drop.from.idx === to.idx && drop.from.slot === to.slot) {
    // Can't drop back into same location
    return false;
  }
  return true;
}

export function isPossible(drop: PossibleDrop): boolean {
  return isTheoretrical(drop, drop.to);
}
