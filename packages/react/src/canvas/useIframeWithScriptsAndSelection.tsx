import { atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useCallback } from 'react';
import { h } from 'snabbdom';
import { RaisinScope } from '../atoms/RaisinScope';
import {
  LocalURLAtom,
  ModuleDetailsAtom,
} from '../component-metamodel/ComponentModel';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import { SetSelectedIdAtom } from '../selection/SelectedAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { useSnabbdomSandboxedIframe } from './useSnabbdomSandboxedIframe';

// HTML script tags for canvas 
export const CanvasScriptsAtom = atom<string>((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  const registry = get(NPMRegistryAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
});

export function useIframeWithScriptsAndSelection() {
  const setSelectedId = useUpdateAtom(SetSelectedIdAtom, RaisinScope);
  const onClick = useCallback((id: string) => setSelectedId(id), [
    setSelectedId,
  ]);
  const canvasScripts = useAtomValue(CanvasScriptsAtom, RaisinScope);
  const registry = useAtomValue(NPMRegistryAtom, RaisinScope);
  const props = useSnabbdomSandboxedIframe({
    initialComponent: h('div', {}),
    onClick,
    head: canvasScripts,
    registry,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}
