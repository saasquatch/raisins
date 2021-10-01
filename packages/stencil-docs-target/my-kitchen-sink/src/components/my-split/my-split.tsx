import { Component, Prop, h } from '@stencil/core';

/**
 * @uiName 2 Columns
 * @slot left - Left Column - Things that should show up on the left
 * @slot right - Right Column - Shows these things on the right
 */
@Component({
  tag: 'my-split',
  shadow: true,
})
export class Mysplit {
  /**
   * Should show backwards?
   */
  @Prop() reverse: boolean;

  render() {
    const col = {
      flex: '1',
      background:"rgba(0,0,0,0.2)",
      padding: "20px"
    } as Record<string, string>;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', padding: "20px", background:"rgba(0,0,0,0.1)" }}>
        <div style={col}>
          <slot name={this.reverse ? 'right' : 'left'}></slot>
        </div>
        <div style={col}>
          <slot name={!this.reverse ? 'right' : 'left'}></slot>
        </div>
      </div>
    );
  }
}
