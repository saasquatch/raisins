import { Component, Prop, h, Host } from '@stencil/core';

/**
 * @uiName Card
 * @slot - Body - Body of the card
 * @slot title - Label - The card label
 * @example Filled - <my-card><span slot=title>Title</span><div>I am a bunch of editable stuff</div></my-split>
 */
@Component({
  tag: 'my-card',
  shadow: true,
})
export class MyCard {
  /**
   * Should show backwards?
   */
  @Prop() label: string;

  render() {
    return (
      <Host style={{ display: 'block' }}>
        <div style={{ border: '1px solid #CCC', borderRadius: '3px' }}>
          <div style={{ background: '#EEE', padding: '10px' }}>
            <slot name={'title'}>{this.label ?? 'Label'}</slot>
          </div>
          <div style={{ background: '#FFF', padding: '10px' }}>
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
