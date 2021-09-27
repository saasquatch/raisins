/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * The top-level interface of a custom elements package.
 *
 * Unlike https://github.com/webcomponents/custom-elements-manifest this package
 * doesn't attempt to descibe the javascript interface of the components, since it is
 * intended to be used primary via HTML and CSS and not via Javascript
 */
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

// Custom element modules
export type Module = {
  /**
   * A markdown summary suitable for display in a listing.
   */
  summary?: string;

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
};

/**
 * The additional fields that a custom element adds to classes and mixins.
 */
export interface CustomElement {
  /**
   * The human-readable name of the component
   */
  title?: string;

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
}

export interface Attribute {
  name: string;

  /**
   * A markdown summary suitable for display in a listing.
   */
  summary?: string;

  /**
   * A markdown description.
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
   */
  default?: string;

  /**
   * The name of the field this attribute is associated with, if any.
   */
  fieldName?: string;

  /**
   * The type of editor that should be used to edit this attribute
   */
  uiWidget?: string;

  /**
   * Additional data for the widget editor to use.
   */
  uiOptions?: object;
}

export interface Slot {
  /**
   * The slot name, or the empty string for an unnamed slot.
   */
  name: string;

  /**
   * A markdown summary suitable for display in a listing.
   */
  summary?: string;

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
}

export interface CssCustomProperty {
  /**
   * The name of the property, including leading `--`.
   */
  name: string;

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

  /**
   * A markdown summary suitable for display in a listing.
   */
  summary?: string;

  /**
   * A markdown description.
   */
  description?: string;
}
