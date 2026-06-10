import type { ErrorEntry, ErrorStack } from "../validation/validateNode/types";

export type CssParseError = {
  rule: "css";
  message: string;
};

export type ParseError = CssParseError;
export type ParseErrorEntry = ErrorEntry<ParseError>;
export type ParseErrorStack = ErrorStack<ParseError>;
