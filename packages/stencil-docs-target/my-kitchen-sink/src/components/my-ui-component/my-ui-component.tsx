import { Component, Prop, h } from '@stencil/core';

/**
 * @uiName Sam Component
 * @uiOrder ["first", "middle", "last", "*"]
 * @validParents ["div"]
 * @slots [{"name":"mySlot", "validChildren":["div"]}]
 * @example Cool Kid - <my-component first=a middle=cool last=kid max-length=400></my-component>
 * @example Nerd Bird - <my-component first=The middle=Nerd last=Bird max-length=400></my-component>
 * @example Surely Sam - <my-component first=The middle=Surely last=Sam max-length=400></my-component>
 * @exampleGroup Cool Kids
 * @slotEditor richText
 */
@Component({
  tag: 'my-ui-component',
  styleUrl: 'my-ui-component.css',
  shadow: true,
})
export class MyUiComponent {
  /**
   * The first name of the user to display to their friends
   *
   * @uiName First Name
   * @uiDefault Your
   */
  @Prop() first: string;

  /**
   * The middle name
   *
   * @uiName Middle Name
   * @uiDefault Best
   */
  @Prop() middle: string;

  /**
   * The last name
   *
   * @uiName Last Name
   * @uiDefault Friend
   */
  @Prop() last: string;

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
   * @uiName Anonymous Label
   * @uiEnum ["Friend", "Buddy", "Pal"]
   * @uiDefault Friend
   */
  @Prop() anonymousLabel: string;

  /**
   * @uiName Text Color
   * @uiEnum ["#F00", "#00F", "#0F0"]
   * @uiEnumNames ["Red", "Blue", "Green"]
   * @uiDefault #F00
   */
  @Prop() textColor: string;

  /**
   * Date to display
   * @uiName Pick a Date
   * @uiWidget DatePicker
   * @uiWidgetOptions {"format":"milliseconds"}
   */
  @Prop() pickedDate: number;

  /**
   * @demo Jeff - {"person": "Jeff"}
   * @demo Jess - {"person": "Jess"}
   * @demo No Name - {}
   */
  @Prop() myDemoProp: {
    person: string;
  };

  private getText(): string {
    let names = [this.first ?? 'Your', this.middle ?? 'Best', this.last ?? 'Friend'].filter(x => x);
    if (this.reverse) {
      names = [...names, 'reversed'].reverse();
    }
    const out = names.join(' ');

    return out.substring(0, out.length < this.maxLength ? out.length : this.maxLength);
  }

  private getDate(): string {
    if (!this.pickedDate) return 'Not selected';
    return new Date(Number(this.pickedDate)).toLocaleString();
  }

  render() {
    return (
      <div style={{ color: this.textColor }}>
        Hello, {this.myDemoProp?.person ?? this.anonymousLabel}! I'm {this.getText()}
        <p>Your date is: {this.getDate()}</p>
      </div>
    );
  }
}
