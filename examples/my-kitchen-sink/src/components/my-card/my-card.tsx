import { Component, Prop, h, Host } from '@stencil/core';

/**
 * @uiName Card
 * @slots [{"name":"","title":"Body","description":"Body of the card"},{"name":"title","title":"Title","description":"The card label"}]
 * @slotEditor inline
 * @example Rich Text - <my-card><span slot=title>Title <u>with</u> <a href="https://www.example.com">link</a></span><div><p>I am a bunch of editable <u>rich</u> <strong>text</strong></p><p>And I am in many paragraphs</p></div></my-split>
 *
 * @csspart header - The card's title bar.
 * @csspart body - The card's main content area.
 *
 * @cssprop --my-card-border-color - Border color of the card's outer frame.
 * @cssprop --my-card-header-bg - Background color of the header.
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
        <div style={{ border: '1px solid var(--my-card-border-color, #CCC)', borderRadius: '3px' }}>
          <div part="header" style={{ background: 'var(--my-card-header-bg, #EEE)', padding: '10px', fontWeight: 'bold' }}>
            <slot name={'title'}>{this.label ?? 'Label'}</slot>
          </div>
          <div part="body" style={{ background: '#FFF', padding: '10px' }}>
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
