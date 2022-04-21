export const ROOT = "root" as const;
export type Root = typeof ROOT;

/** Type for Text */
export const TEXT = "text" as const;
export type Text = typeof TEXT;

/** Type for <? ... ?> */
/** Type for <!doctype ...> */
export const DIRECTIVE = "directive" as const;
export type Directive = typeof DIRECTIVE;

/** Type for <![CDATA[ ... ]]> */
/** Type for <!-- ... --> */
export const COMMENT = "comment" as const;
export type Comment = typeof COMMENT;

/** Type for <style> tags */
export const STYLE = "style";
export type Style = typeof STYLE;

/** Type for <script> tags */
/** Type for Any tag */
export const TAG = "tag" as const;
export type Tag = typeof TAG;

export type DomElementType =
  | Root
  | Text
  | Directive
  | Comment
  | Tag;
