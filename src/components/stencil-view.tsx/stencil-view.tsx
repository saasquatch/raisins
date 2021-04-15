import { Component, h, Prop, VNode } from '@stencil/core';

@Component({
  tag: 'stencil-view',
  shadow: false,
})
export class HasSlots {
  @Prop({
    mutable: true,
  })
  view: VNode | VNode[] = (<div />);

  constructor() {}

  disconnectedCallback() {}

  render() {
    return this.view;
  }
}
