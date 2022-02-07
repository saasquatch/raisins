import { atom } from 'jotai';
import { SetSelectedIdAtom } from '../selection/SelectedAtom';
import {
  HoveredRectAtom,
  SelectedRectAtom,
  SetHoveredIdAtom,
} from './CanvasHoveredAtom';
import { CanvasEvent } from './SnabbdomSanboxedIframeAtom';

export const CanvasEventAtom = atom(
  null,
  (get, set, { target, type }: CanvasEvent) => {
    if (type === 'click') {
      set(SetSelectedIdAtom, target?.attributes['raisins-id']);
      if (target) {
        set(SelectedRectAtom, {
          x: target.rect.x,
          y: target.rect.y,
          height: target.rect.height,
          width: target.rect.width,
        });
      }
    }
    if (type === 'mouseover') {
      set(SetHoveredIdAtom, target?.attributes['raisins-id']);
      if (target) {
        set(HoveredRectAtom, {
          x: target.rect.x,
          y: target.rect.y,
          height: target.rect.height,
          width: target.rect.width,
        });
      }
    }
  }
);
