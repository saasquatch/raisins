/**
 * An error stack is just a list of errors
 * with their related json path.
 *
 * ErrorStack is generic, so it works with various error objects
 * as needed, but defaults to simple string errors.
 */
export type ErrorStack<T = string> = ErrorEntry<T>[];

export type ErrorEntry<T = string> = {
  /**
   * An RFC-6901 json pointer (https://datatracker.ietf.org/doc/html/rfc6901)
   * 
   * 
   * For example, given the JSON document
   {
      "foo": ["bar", "baz"],
      "": 0,
      "a/b": 1,
      "c%d": 2,
      "e^f": 3,
      "g|h": 4,
      "i\\j": 5,
      "k\"l": 6,
      " ": 7,
      "m~n": 8
   }

   The following JSON strings evaluate to the accompanying values:

    ""           // the whole document
    "/foo"       ["bar", "baz"]
    "/foo/0"     "bar"
    "/"          0
    "/a~1b"      1
    "/c%d"       2
    "/e^f"       3
    "/g|h"       4
    "/i\\j"      5
    "/k\"l"      6
    "/ "         7

   */
  jsonPointer: string;
  error: T;
};
