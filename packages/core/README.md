# Raisins Core

Raisins in a WYSIWYG visual editor for HTML and web components. The core package provides utility functions that are used to validate the HTML being edited and provide additional data, such as parent / child slot validation, locations for moving a node from one location to another, and more.

## Available Functions

| Function                 | description                                                                                                                            | Returns                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| htmlSerializer           | Renders a DOM node or an array of DOM nodes to a string                                                                                | string                      |
| htmlParser               | Parses HTML into a `RaisinDocumentNode`                                                                                                | RaisinDocumentNode          |
| isNodeWithChildren       | Determines whether the node has any children                                                                                           | boolean                     |
| isElementNode            | Determines if the given node is an HTML element                                                                                        | boolean                     |
| isRoot                   | Determines if the given node is the root element                                                                                       | boolean                     |
| isStyleNode              | Determines if the given node is a style element                                                                                        | boolean                     |
| isTextNode               | Determines if the given node is a text-only node                                                                                       | boolean                     |
| isCommentNode            | Determines if the given node is an HTML comment                                                                                        | boolean                     |
| isDirectiveNode          | Determines if the given node is a directive (eg. `<!doctype ...>`)                                                                     | boolean                     |
| getSlots                 | Returns the available slots based on a node and metadata                                                                               | NodeWithSlots \| undefined  |
| doesChildAllowParent     | Given a tag's metadata, checks if it allows children                                                                                   | boolean                     |
| doesParentAllowChild     | Given a child and it's parent's metadata, checks if the parent will allow the child to be embedded                                     | boolean                     |
| isNodeAllowed            | Given two nodes and their metadata, check each side to determine if the parent allows the child, and the child allows the parent       | boolean                     |
| validateNode             | Given a node and its meta, return errors of any type                                                                                   | ErrorStack                  |
| validateChildConstraints | Given a node and its meta, return errors if either of the parent or child are in an invalid position                                   | ErrorStack                  |
| validateAttributes       | Given a node and its meta, return errors if any attributes have invalid values                                                         | ErrorStack                  |
| generateJsonPointers     | Generate a set of JSON Pointers for all descendents of a `RaisinNode`                                                                  | WeakMap<RaisinNode, string> |
| getSubErrors             | Given a JSON Pointer, return any errors that are descendants of the node at the given pointer                                          | ErrorStack<T>               |
| hasSubErrors             | Given a JSON Pointer, return true if there are any descendants of the node at the given pointer                                        | boolean                     |
| removeError              | Given a JSON Pointer, remove the error at that path and return a new list of errors                                                    | ErrorStack<T>               |
| calculatePlopTargets     | Given a parent `RaisinNode`, a potential plop target as a `RaisinNode` and any metadata, return a `PlopTarget` for each valid position | PlopTarget[]                |
| getNode                  | Given the root node and a `NodePath`, return the `RaisinNode`                                                                          | RaisinNode                  |
| getPath                  | Given the root node and a descendant node, return a `NodePath` if it's found                                                           | NodePath \| undefined       |
| cssSerializer            | Converts a plain CSS node AST into a css string                                                                                        | string                      |
| cssParser                | Parses a CSS expression and returns a pure js object AST representation of the content                                                 | CssNodePlain                |
| cssSelector              | Given a `RaisinDocumentNode` and a css query string, return all matches found as `RaisinElementNode[]`                                 | RaisinElementNode[]         |

## Other Exports

- HTMLComponents
  - Mappings for all HTML Elements as `CustomElement`s for use in the raisins ecosystem
- DefaultTextMarks
  - An array of all HTML Elements that should be treated as text nodes for editing purposes
- htmlUtil
  - A library of HTML Utility functions
- cssUtil
  - A library of CSS Utility functions
