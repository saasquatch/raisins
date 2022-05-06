import { Component, Prop, h, Host } from '@stencil/core';

/**
 * @uiName Card
 * @slots [{"title":"Body", "description": "Body of the card"},{"title":"Label", "description": "The card label"}]
 * @slotEditor inline
 * @example Rich Text - <my-card><span slot=title>Title <u>with</u> <a href="https://www.example.com">link</a></span><div><p>I am a bunch of editable <u>rich</u> <strong>text</strong></p><p>And I am in many paragraphs</p></div></my-split>
 * @canvasRenderer always-replace
 */
@Component({
  tag: 'my-shadowless-card',
  shadow: false,
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
          <div style={{ background: '#EEE', padding: '10px', fontWeight: 'bold' }}>
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
