import { Component, Prop, h } from '@stencil/core';

/**
 * @uiName My Component
 * @example Cool Kid - <my-component first=a middle=cool last=kid max-length=400></my-component>
 */
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * The first name of the user to display to their friends
   *
   * @uiName First Noah
   * @uiDefault Friend
   */
  @Prop() first: string = 'Friend';

  /**
   * The middle name
   *
   * @uiName Middle Name
   */
  @Prop() middle: string;

  /**
   * The last name
   *
   * @uiName Last Name
   */
  @Prop() last: string;

  /**
   * Truncates names longer than this
   *
   * @uiName Max Length
   * @uiDefault 4
   */
  @Prop() maxLength: number = 4;

  /**
   * Should show backwards?
   */
  @Prop() reverse: boolean;

  private getText(): string {
    let names = [this.first ?? 'friend', this.middle, this.last].filter(x => x);
    if (this.reverse) {
      names = [...names, 'reversed'].reverse();
    }
    const out = names.join(' ');

    return out.substring(0, out.length < this.maxLength ? out.length : this.maxLength);
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
