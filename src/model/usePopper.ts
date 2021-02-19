/**
 *
 *
 *
 *
 *  Forked from https://github.com/popperjs/react-popper/blob/master/src/usePopper.js
 *
 *
 *
 *
 *
 *
 *
 */
import { createPopper as defaultCreatePopper, Options as PopperOptions, VirtualElement, Instance } from '@popperjs/core';
import { useEffect, useMemo, useRef, useState } from '@saasquatch/stencil-hooks';
//   import isEqual from 'react-fast-compare';
//   import { fromEntries, useIsomorphicLayoutEffect } from './utils';
import debugFN from 'debug';
import { equal } from '@wry/equality';

const debug = debugFN('usePopper');

type Options = Partial<
  PopperOptions & {
    createPopper: typeof defaultCreatePopper;
  }
>;

type State = {
  styles: {
    [key: string]: Partial<CSSStyleDeclaration>;
  };
  attributes: {
    [key: string]: { [key: string]: string };
  };
};

const EMPTY_MODIFIERS = [];

export const usePopper = (referenceElement?: Element | VirtualElement, popperElement?: HTMLElement, options: Options = {}) => {
  const prevOptions = useRef<PopperOptions>(null);

  const optionsWithDefaults = {
    onFirstUpdate: options.onFirstUpdate,
    placement: options.placement || 'bottom',
    strategy: options.strategy || 'absolute',
    modifiers: options.modifiers || EMPTY_MODIFIERS,
  };

  const [state, setState] = useState<State>({
    styles: {
      popper: {
        position: optionsWithDefaults.strategy,
        left: '0',
        top: '0',
      },
      arrow: {
        position: 'absolute',
      },
    },
    attributes: {},
  });

  const updateStateModifier = useMemo(
    () => ({
      name: 'updateState',
      enabled: true,
      phase: 'write',
      fn: ({ state }) => {
        const elements = Object.keys(state.elements);

        setState({
          styles: fromEntries(elements.map(element => [element, state.styles[element] || {}])),
          attributes: fromEntries(elements.map(element => [element, state.attributes[element]])),
        });
      },
      requires: ['computeStyles'],
    }),
    [],
  );

  const popperOptions = useDeepMemo(() => {
    const newOptions = {
      onFirstUpdate: optionsWithDefaults.onFirstUpdate,
      placement: optionsWithDefaults.placement,
      strategy: optionsWithDefaults.strategy,
      modifiers: [...optionsWithDefaults.modifiers, updateStateModifier, { name: 'applyStyles', enabled: false }],
    };

    if (isEqual(prevOptions.current, newOptions)) {
      return prevOptions.current || newOptions;
    } else {
      prevOptions.current = newOptions;
      return newOptions;
    }
  }, [optionsWithDefaults.onFirstUpdate, optionsWithDefaults.placement, optionsWithDefaults.strategy, optionsWithDefaults.modifiers, updateStateModifier]);

  const popperInstanceRef = useRef<Instance>(undefined);

  useIsomorphicLayoutEffect(() => {
    debug('Updating options');
    if (popperInstanceRef.current) {
      popperInstanceRef.current.setOptions(popperOptions);
    }
  }, [popperOptions]);

  useIsomorphicLayoutEffect(() => {
    debug('Updating elements');
    if (referenceElement == null || popperElement == null) {
      return;
    }

    const createPopper = options.createPopper || defaultCreatePopper;
    const popperInstance = createPopper(referenceElement, popperElement, popperOptions);

    popperInstanceRef.current = popperInstance;

    return () => {
      popperInstance.destroy();
      popperInstanceRef.current = null;
    };
  }, [referenceElement, popperElement, options.createPopper]);

  return {
    state: popperInstanceRef.current ? popperInstanceRef.current.state : null,
    styles: state.styles,
    attributes: state.attributes,
    update: popperInstanceRef.current ? popperInstanceRef.current.update : null,
    forceUpdate: popperInstanceRef.current ? popperInstanceRef.current.forceUpdate : null,
  };
};

/**
 * Simple ponyfill for Object.fromEntries
 */
const fromEntries = (entries: Array<[string, any]>) =>
  entries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

function isEqual(...args) {
  debug('TODO implement `isEqual` for performance', ...args);
  return true;
}

function useIsomorphicLayoutEffect(cb: () => void | VoidFunction, deps?: unknown[]) {
  useEffect(() => {
    let unMount: VoidFunction | void;
    setTimeout(() => (unMount = cb()), 100);
    return () => unMount && unMount();
  }, deps);
}

export function useDeepMemo<TKey, TValue>(memoFn: () => TValue, key: TKey): TValue {
  //@ts-ignore
  const ref = useRef<{ key: TKey; value: TValue }>();

  if (!ref.current || !equal(key, ref.current.key)) {
    ref.current = { key, value: memoFn() };
  }

  return ref.current.value;
}
