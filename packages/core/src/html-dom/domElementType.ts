export const ROOT = "root" as const;
export type Root = typeof ROOT;

/** Type for Text */
export const TEXT = "text" as const;
export type Text = typeof TEXT;

/** Type for <? ... ?> */
export const DIRECTIVE = "directive" as const;
export type Directive = typeof DIRECTIVE;

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

/** Type for <![CDATA[ ... ]]> */
export const CDATA = "cdata" as const;
export type CDATA = typeof CDATA;

/** Type for <!doctype ...> */
export const DOCTYPE = "doctype" as const;
export type Doctype = typeof DOCTYPE;

export type DomElementType =
  | Root
  | Text
  | Directive
  | Comment
  | Tag
  | CDATA
  | Doctype;
