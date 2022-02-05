import { atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { h } from 'snabbdom';
import { RaisinScope } from '../atoms/RaisinScope';
import {
  LocalURLAtom,
  ModuleDetailsAtom,
} from '../component-metamodel/ComponentModel';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import { SetSelectedIdAtom } from '../selection/SelectedAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { HoveredRectAtom, SelectedRectAtom, SetHoveredIdAtom } from './HoveredAtom';
import {
  CanvasEvent,
  useSnabbdomSandboxedIframe,
} from './useSnabbdomSandboxedIframe';

// HTML script tags for canvas
export const CanvasScriptsAtom = atom<string>((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  const registry = get(NPMRegistryAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
});

const onEventAtom = atom(null, (get, set, { target, type }: CanvasEvent) => {
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
});

export function useIframeWithScriptsAndSelection() {
  const onEvent = useUpdateAtom(onEventAtom, RaisinScope);
  const canvasScripts = useAtomValue(CanvasScriptsAtom, RaisinScope);
  const registry = useAtomValue(NPMRegistryAtom, RaisinScope);
  const props = useSnabbdomSandboxedIframe({
    initialComponent: h('div', {}),
    onEvent,
    head: canvasScripts,
    registry,
    selector: `[raisins-id]`,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}
