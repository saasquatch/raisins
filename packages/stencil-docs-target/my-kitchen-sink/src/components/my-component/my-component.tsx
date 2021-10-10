import { Component, Prop, h } from '@stencil/core';

/**
 * @uiName My Component
 * @example Cool Kid - <my-component first=a middle=cool last=kid max-length=400></my-component>
 * @example Nerd Bird - <my-component first=The middle=Nerd last=Bird max-length=400></my-component>
 * @example Surely Sam - <my-component first=The middle=Surely last=Sam max-length=400></my-component>
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
   * @uiDefault Your
   */
  @Prop() first: string = 'Your';

  /**
   * The middle name
   *
   * @uiName Middle Name
   */
  @Prop() middle: string = "Company";

  /**
   * The last name
   *
   * @uiName Last Name
   */
  @Prop() last: string = "Rep";

  /**
   * Truncates names longer than this
   *
   * @uiName Max Length
   * @uiDefault 6
   */
  @Prop() maxLength: number = 6;

  /**
   * Should show backwards?
   */
  @Prop() reverse: boolean;

  /**
   * What to call people if we don't have their name
   */
  @Prop() anonymousLabel: string = "Friend"

  /**
   * @demo Jeff - {"person": "Jeff"}
   * @demo Jess - {"person": "Jess"}
   * @demo No Name - {}
   */
  @Prop() myDemoProp: {
    person: string;
  };

  private getText(): string {
    let names = [this.first ?? 'friend', this.middle, this.last].filter(x => x);
    if (this.reverse) {
      names = [...names, 'reversed'].reverse();
    }
    const out = names.join(' ');

    return out.substring(0, out.length < this.maxLength ? out.length : this.maxLength);
  }

  render() {
    return (
      <div>
        Hello, {this.myDemoProp?.person ?? this.anonymousLabel}! I'm {this.getText()}
      </div>
    );
  }
}
