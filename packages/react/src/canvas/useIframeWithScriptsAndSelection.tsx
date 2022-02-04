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
import { SetHoveredIdAtom } from './HoveredAtom';
import { useSnabbdomSandboxedIframe } from './useSnabbdomSandboxedIframe';

// HTML script tags for canvas
export const CanvasScriptsAtom = atom<string>((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  const registry = get(NPMRegistryAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
});

const onEventAtom = atom(
  null,
  (get, set, { target, type }: { target: string; type: string }) => {
    if (type === 'click') {
      set(SetSelectedIdAtom, target);
    }
    if (type === 'mouseover') {
      set(SetHoveredIdAtom, target);
    }
    console.log("Canvas event", type, target)
  }
);

export function useIframeWithScriptsAndSelection() {
  const onEvent = useUpdateAtom(onEventAtom, RaisinScope);
  const canvasScripts = useAtomValue(CanvasScriptsAtom, RaisinScope);
  const registry = useAtomValue(NPMRegistryAtom, RaisinScope);
  const props = useSnabbdomSandboxedIframe({
    initialComponent: h('div', {}),
    onEvent,
    head: canvasScripts,
    registry,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}
