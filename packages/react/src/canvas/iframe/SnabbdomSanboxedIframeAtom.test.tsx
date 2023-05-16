/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react-hooks/dom';
import expect from 'expect';
import { atom, useAtom } from 'jotai';
import { molecule, ScopeProvider, useMolecule } from 'jotai-molecules';
import React from 'react';
import { h } from 'snabbdom';
import { unpkgNpmRegistry } from '../../util/NPMRegistry';
import {
  SnabbdomIframeMolecule,
  SnabbdomIframeProps,
  SnabbdomIframeScope,
} from './SnabbdomSanboxedIframeAtom';

describe('Thing', () => {
  const useSnabbsom = () => {
    const atoms = useMolecule(SnabbdomIframeMolecule);
    const [state, setState] = useAtom(atoms);
    return { state, setState };
  };

  const Props = molecule<SnabbdomIframeProps>(() => {
    return {
      head: atom(''),
      onEvent: atom(null, () => {}),
      onResize: atom(null, () => {}),
      registry: atom(unpkgNpmRegistry),
      selector: atom('[raisin-events]'),
      eventTypes: atom(new Set<string>()),
      vnodeAtom: atom(h('div')),
    };
  });
  it('Fails without a wrapper', () => {
    const { result } = renderHook(() => useSnabbsom());
    expect(result.error).toBeTruthy();
  });

  it('Should render an iframe', async () => {
    const Wrapper: React.FC = ({ children }) => (
      <ScopeProvider scope={SnabbdomIframeScope} value={Props}>
        {children}
      </ScopeProvider>
    );
    const { result, waitForNextUpdate } = renderHook(() => useSnabbsom(), {
      wrapper: Wrapper,
    });

    expect(result.current.state.type).toBe('uninitialized');

    const element: HTMLElement | undefined = document.createElement('div');
    document.body.appendChild(element);

    act(() => {
      result.current.setState(element);
    });
    expect((result.current.state as any).error).toBeUndefined();
    expect(result.current.state.type).toBe('initializing');

    await waitForNextUpdate();
    expect((result.current.state as any).error).toBeUndefined();
    expect(result.current.state.type).toBe('loaded');
  });
});
