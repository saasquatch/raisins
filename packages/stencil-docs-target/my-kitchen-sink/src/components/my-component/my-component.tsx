import { Component, Prop, h } from '@stencil/core';
/**
 * @uiName My Component
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
   * @uiName First Name
   */
  @Prop() first: string;

  /**
   * The middle name
   * 
   * @uiName Middle Name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  private getText(): string {
    return this.first + ' ' + this.middle + ' ' + this.last;
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
