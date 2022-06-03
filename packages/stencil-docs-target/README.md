## Raisins Stencil Docs Target

A [custom docs target](https://stenciljs.com/docs/docs-custom) for Stencil that generates a file compatible with `@raisins/schema` library description format.

- Component annotations

```js
import { Config } from '@stencil/core';
import plugin from '@raisins/stencil-docs-target';

export const config: Config = {
  outputTargets: [plugin({})],
};
```

```js
/**
 * @uiName My Component
 * @uiOrder ["first", "middle", "last", "*"]
 * @validParents ["div"]
 * @slots [{"name":"mySlot", "validChildren":["div"]}]
 * @example Cool Kid - <my-component first=a middle=cool last=kid max-length=400></my-component>
 * @example Nerd Bird - <my-component first=The middle=Nerd last=Bird max-length=400></my-component>
 * @example Surely Sam - <my-component first=The middle=Surely last=Sam max-length=400></my-component>
 * @exampleGroup Cool Kids
 * @slotEditor richText
 * @canvasRenderer always-replace
 */
@Component({
  tag: 'my-ui-component',
  styleUrl: 'my-ui-component.css',
  shadow: true,
})
export class MyUiComponent {...}
```

- Attribute annotations

```js
  /**
   * What to call people if we don't have their name
   * @uiName Anonymous Label
   * @uiEnum ["Friend", "Buddy", "Pal"]
   * @default Friend
   */
  @Prop() anonymousLabel: string;

  /**
   * @uiName Text Color
   * @uiEnum ["#F00", "#00F", "#0F0"]
   * @uiEnumNames ["Red", "Blue", "Green"]
   * @default #F00
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
   * A hidden field for internal use only
   * @undocumented
   */
  @Prop() undocumentedField: number;
```
