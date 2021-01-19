import { Component, h } from '@stencil/core';

@Component({
  tag: 'has-slots',
  shadow:true
})
export class HasSlots {
  constructor() {}

  disconnectedCallback() {}

  render() {
    return (
      <div>
        <table>
          <tr>
            <td>
              <slot name="slot-2" />
            </td>
            <td>
              <slot name="slot-1" />
            </td>
          </tr>
        </table>
      </div>
    );
  }
}
