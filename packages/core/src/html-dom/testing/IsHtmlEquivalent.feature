Feature: HTML Equivalency Checker

    HTML Comparison is hard because there are many ways of writing HTML where it might be a different string, but equivalent for most purposes.
    For example, minified HTML should be equivalent to the source HTML, even though it has less whitespace.

    Based roughty on `node.isEqualNode` (https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode) except that it's not implemented in jsdom,
    and it doesn't look for CSS equivalency.

    Scenario Outline: Differences in simple nodes will fail
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                    | Second        |
            | <div></div>              |               |
            | <div></div>              | <span></span> |
            | <div id></div>           | <div></div>   |
            | <div id=""></div>        | <div></div>   |
            | <div id="value"></div>   | <div></div>   |
            | <div>Has text</div>      | <div></div>   |
            | <div><span></span></div> | <div></div>   |

    Scenario Outline: Attribute order does not matter
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                      | Second                     |
            | <div a b></div>            | <div b a></div>            |
            | <span a="value" b></span>  | <span b a="value"></span>  |
            | <div><h1 a b></h1></div>   | <div><h1 b a></h1></div>   |
            | <div a b><p b a></p></div> | <div b a><p a b></p></div> |

    Scenario Outline: Extra whitespace does not matter
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                     | Second                          |
            | <div> </div>              | <div>  </div>                   |
            | <body><div> </div></body> | <body><div>       </div></body> |

    Scenario Outline: Whitespace does matter
        The presences of whitespace matters in certain situations because it affects text rendering
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                         | Second                       |
            | <div>Hello <b>World</b></div> | <div>Hello<b>World</b></div> |

    @skip
    Scenario Outline: Unequivalent CSS will cause failures
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                               | Second                         |
            | <div style="display: none; "></div> | <div style="bold:true;"></div> |

    @skip
    Scenario Outline: Unequivalent CSS will ignore text differences
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                                  | Second                             |
            | <div style="   display: none; "></div> | <div style="display: none;"></div> |