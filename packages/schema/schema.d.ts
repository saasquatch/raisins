export interface Package {
  /**
   * The version of the schema used in this file.
   */
  schemaVersion: string;
  /**
   * An array of the modules this package contains.
   */
  modules: Array<Module>;
}

/**
 * Examples that can be used for dropping in content into the raisins editor
 */
export type Example = {
  title: string;
  content: string;
  tagName?: string;
  exampleGroup?: string;
};

// Custom element modules
export type Module = {
  /**
   * A markdown title suitable for display in a listing.
   */
  title?: string;

  /**
   * A markdown description of the module.
   */
  description?: string;

  /**
   * The declarations of a module.
   *
   * For documentation purposes, all declarations that are reachable from
   * exports should be described here. Ie, functions and objects that may be
   * properties of exported objects, or passed as arguments to functions.
   */
  tags?: Array<CustomElement>;

  /**
   * Example content
   */
  examples?: Array<Example>;
};

/**
 * The additional fields that a custom element adds to classes and mixins.
 */
export interface CustomElement {
  /**
   * A markdown title suitable for display in a listing.
   */
  title?: string;

  /**
   * A markdown description of the module.
   */
  description?: string;

  /**
   * The name of the registered custom element tag
   */
  tagName: string;

  /**
   * The attributes that this element is known to understand.
   */
  attributes?: Attribute[];

  /**
   * The shadow dom content slots that this element accepts.
   */
  slots?: Slot[];

  /**
   * A set of CSS selectors for validating parents
   *
   * Defaults to ["*"]
   */
  validParents?: string[];

  cssProperties?: CssCustomProperty[];

  /**
   * HTML examples of how this content can be used
   */
  examples?: Array<Example>;

  /**
   * Named group for the example content
   */
  exampleGroup?: string;

  /**
   * Array of meaningful tags to enforce feature use within the raisins editor
   */
  requiredFeatures?: string[];

  /**
   * Text to display in a tooltip when the element is disabled due to feature enforcement.
   */
  featureTooltip?: string;

  /**
   * States for previewing the internal state of components
   */
  demoStates?: {
    states: Array<ComponentState>;
    tag: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: any;
  };

  /**
   * Which editor toolbar to show when this element is selected
   */
  slotEditor?: string;

  /**
   * Rules for how this element should rendered in the Raisins canvas.
   *
   * Possible values:
   *  - in-place-update - Changes to this element are rendered on the canvas by mutating a cached HTML element via setAttribute, appendNode, etc.
   *  - always-replace - Changes to this element are rended on a fresh element created via `createElement`.
   *
   * Defaults to `in-place-update`.
   *
   */
  canvasRenderer?: "in-place-update" | "always-replace";
}

export interface Attribute {
  /**
   * The key used in HTML
   */
  name: string;

  /**
   * A markdown title suitable for display in a listing.
   */
  title?: string;

  /**
   * A markdown description of the module.
   */
  description?: string;

  /**
   * The type that the attribute will be serialized/deserialized as.
   */
  type?: string;

  /**
   * The default value of the attribute, if any.
   *
   * As attributes are always strings, this is the actual value, not a human
   * readable description.
   *
   * For boolean attributes this should be "" for true, and undefined for false
   */
  default?: string;

  /**
   * Array of possible values to select from where elements might be of any type, including null.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enum?: any[];

  /**
   * Human readable string to represent each of the values from `enum`.
   */
  enumNames?: string[];

  /**
   * Inclusive maximum value of the attribute, only valid for number type.
   */
  maximum?: number;

  /**
   * Inclusive minimum value of the attribute, only valid for number type.
   */
  minimum?: number;

  /**
   * Maximum length of the value of the attribute, only valid for string type.
   */
  maxLength?: number;

  /**
   * Minimum length of the value of the attribute, only valid for string type.
   */
  minLength?: number;

  /**
   * Valid format of the attribute's value
   * TODO: need to decide how much of this we want to support
   * https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.7.3
   */
  format?: string;

  /**
   * The type of editor that should be used to edit this attribute.
   */
  uiWidget?: string;

  /**
   * Additional data for the widget editor to use.
   */
  uiWidgetOptions?: object;

  /**
   * Group that the attribute will be displayed within.
   */
  uiGroup?: string;

  /**
   * Order that the attribute will be displayed in.
   */
  uiOrder?: number;

  /**
   * If required is set to true this attribute must not be undefined.
   */
  required?: boolean;

  /**
   * Array of meaningful tags to enforce feature use within the raisins editor.
   */
  requiredFeatures?: string[];

  /**
   * Text to display in a tooltip when the attribute is disabled due to feature enforcement.
   */
  featureTooltip?: string;
}

export interface ComponentState {
  /**
   * A name for displaying to end users
   */
  title: string;
  /**
   * Map of property names to values.
   */
  props: object;
  /**
   * Name of slot
   */
  slot: string;
  /**
   * Array of component tags that this state depends on
   */
  dependencies: Array<string>;
  /**
   * Metadata
   */
  meta: Record<string, unknown>;
}

export interface Slot {
  /**
   * The slot name, or the empty string for an unnamed slot.
   *
   * The key used in HTML
   */
  name: string;

  /**
   * A markdown title suitable for display in a listing.
   */
  title?: string;

  /**
   * A markdown description.
   */
  description?: string;

  /**
   * A set of CSS selectors for validating children
   *
   * Defaults to ["*"]
   */
  validChildren?: string[];

  /**
   * Layout of the slot. Used for UI hints on layout
   */
  orientation?: "up-down" | "left-right" | "right-left" | "down-up";

  /**
   * Name of the editor used in the UI. Can be used for providing
   * rich text editing of children.
   */
  editor?: string;
}

export interface CssCustomProperty {
  /**
   * The name of the property, including leading `--`.
   *
   * The key used in CSS
   */
  name: string;

  /**
   * A markdown title suitable for display in a listing.
   */
  title?: string;

  /**
   * A markdown description.
   */
  description?: string;

  /**
   * The expected syntax of the defined property. Defaults to "*".
   *
   * The syntax must be a valid CSS [syntax string](https://developer.mozilla.org/en-US/docs/Web/CSS/@property/syntax)
   * as defined in the CSS Properties and Values API.
   *
   * This can be parsed by css-tree: https://github.com/csstree/csstree/blob/master/docs/definition-syntax.md
   *
   * Examples:
   *
   * "<color>": accepts a color
   * "<length> | <percentage>": accepts lengths or percentages but not calc expressions with a combination of the two
   * "small | medium | large": accepts one of these values set as custom idents.
   * "*": any valid token
   */
  syntax?: string;

  default?: string;
}
