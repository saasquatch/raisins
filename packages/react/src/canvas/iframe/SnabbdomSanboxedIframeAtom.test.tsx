import expect from 'expect';
import { atom, useAtom } from 'jotai';
import { molecule, ScopeProvider, useMolecule } from 'bunshi/react';
import React from 'react';
import { h } from 'snabbdom';
import { unpkgNpmRegistry } from '../../util/NPMRegistry';
import {
  SnabbdomIframeMolecule,
  SnabbdomIframeProps,
  SnabbdomIframeScope,
} from './SnabbdomSanboxedIframeAtom';
import { act, renderHook, waitFor } from '@testing-library/react';

describe('Thing', () => {
  const useSnabbdom = () => {
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
    expect(() => {
      const { result } = renderHook(() => useSnabbdom());
    }).toThrowError();
  });

  // TODO: Move this testing functionality to playwright tests
  it.skip('Should render an iframe', async () => {
    const Wrapper: React.FC = ({ children }) => (
      <ScopeProvider scope={SnabbdomIframeScope} value={Props}>
        {children}
      </ScopeProvider>
    );
    const { result } = renderHook(() => useSnabbdom(), {
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

    await waitFor(() => result.current.state.type === 'loaded');
    expect((result.current.state as any).error).toBeUndefined();
    expect(result.current.state.type).toBe('loaded');
  });
});
