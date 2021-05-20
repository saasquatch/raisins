/**
 * Community modifier to make popovers the same width as the element.
 *
 * https://popper.js.org/docs/v2/modifiers/community-modifiers/
 */
export const sameWidth = {
  name: 'sameWidth' as const,
  enabled: true,
  phase: 'beforeWrite' as const,
  requires: ['computeStyles'],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
  },
};
