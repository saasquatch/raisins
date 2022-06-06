## Raisins Stencil Docs Target

A [custom docs target](https://stenciljs.com/docs/docs-custom) for Stencil that generates a file compatible with `@raisins/schema` library description format. The generated file powers the user experience in the `@raisins/react` editor and functionality of `@raisins/core`. Component packages require these custom stencil docs to work with the raisins editor - be sure to annotate your components and attributes.

## Component Annotations
| Tag |Description | example |
|-|-|-|
|uiName | Human readable component name.| @uiName My Component |
|validParents | An array of strings, where each string is the tag of an element that could be this component's parent in the DOM. This can be left empty to show that any parent element is valid. | @validParents ["div", "my-component"]|
|slots| An array of objects, where each object specifies a slot in the component. Always includes a name and a title. Valid children can be included with the tags of elements that could be this component's child in the DOM. This can be left empty to show that any element is a valid child. | @slots [{"name":"mySlot", "title":"My Slotted Content", "validChildren":["div"]}]|
| example | An example of the component's usage. The format is the human name first and then the HTML, seperated by a dash `-`.| @example Cool Kid - <my-component first="a" middle="cool" last="kid" max-length="400"></my-component> |
| exampleGroup | Human readable name to group component examples by. Examples are grouped and displayed within a drop down titles with the `exampleGroup` value in the raisins editor.  | @exampleGroup Cool Kids |
|slotEditor| Used to dictate if a rich text editor should appear when editing the content of the component's slots. | @slotEditor richText|
|canvasRenderer| Dictates how this component is rendered on the canvas. Using `always-replace` wipes the state of the component when interacting with it on the canvas; be sure to use `always-replace` for components without shadow DOM. The default is `in-place-update` which does not destroy the state of the component when interacting with it on the canvas. If no annotation is provided `in-place-update` is used. | @canvasRenderer always-replace|


## Attributes Annotations
| Tag | description | example |
|-|-|-|
|uiName| The human readable attribute name. | @uiName My Attribute|
|uiType| The type of the attribute, string, number, boolean, object, etc. The parser will automatically pick up the declared type of the attribute, but this overwrites that. |@uiType string|
|default| The default value of the attribute. The parser will automatically pick up the declared default of the attribute, but this overwrites that. | @default My Value|
|required| Determines if this attribute is required in attribute validation. | @required|
|uiEnum| An array of values that could be used as the attribute value. | @uiEnum ["option1", "option2"]|
|uiEnumNames| An array of human readable titles for enum options. The values of `uiEnum` will be used if `uiEnumNames` is not defined.|@uiEnumNames ["Option 1", "Option 2"]|
|uiWidget| The uiWidget displayed to end users in the raisins editor. By default all attributes map to default uiWidgets based on type. This can be ovewritten or used for special widgets such as `textArea`, `color`, `dateRange`, `statTypeSelectWidget`, `imageUpload` and `programSelector`. | @uiWidget dateRange |
|uiWidgetOptions| Additional information to be used with an attribute's `uiWidget`. | @uiWidgetOptions {"allowPastDates":true, "months": 1}|
|maximum| The maximum value of this attribute, used in validation for number type attributes. | @maximum 12|
|minimum| The minimum value of this attribute, used in validation for number type attributes. | @minimum 1 |
|maxLength| The maximum length of this attribute, used in validation for string type attributes. | @maxLength 12 |
|minLength| The minimum length of this attribute, used in validation for string type attributes.| @minLength 1 |
|format| The format of this attribute: `url`, `color`, `date-interval`. Used in validation to make sure attribute values adhear to format standards. | @format color |
|uiGroup| Human readable name to group attributes by. Attributes are grouped and displayed within a drop down titled with the `uiGroup` value in the raisins editor.| @uiGroup My Group|
|undocumented| Hides the attribute in the raisins editor. | @undocumented |

## Examples
Below are a set of examples for what component and attribute annotations may look like in the wild.

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
 * @slots [{"name":"mySlot", "title":"My Slotted Content", "validChildren":["div"]}]
 * @example Cool Kid - <my-component first="a" middle="cool" last="kid" max-length="400"></my-component>
 * @example Nerd Bird - <my-component first="The" middle="Nerd" last="Bird" max-length="400"></my-component>
 * @example Surely Sam - <my-component first="The" middle="Surely" last="Sam" max-length="400"></my-component>
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
   * @uiWidget dateRange
   * @uiWidgetOptions {"allowPastDates":true, "months": 1}
   */
  @Prop() pickedDate: number;

  /**
   * A hidden field for internal use only
   * @undocumented
   */
  @Prop() undocumentedField: number;
```

## Associated Packages
Other related raisins packages:
- [@raisins/schema](https://www.npmjs.com/package/@raisins/schema)
- [@raisins/react](https://www.npmjs.com/package/@raisins/react)
- [@raisins/core](https://www.npmjs.com/package/@raisins/core)