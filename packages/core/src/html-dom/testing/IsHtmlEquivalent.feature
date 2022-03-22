Feature: HTML Equivalency Checker

    HTML Comparison is hard because there are many ways of writing HTML where it might be a different string, but equivalent for most purposes.
    For example, minified HTML should be equivalent to the source HTML, even though it has less whitespace.

    Based roughty on `node.isEqualNode` (https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode) except that it's not implemented in jsdom,
    and it doesn't look for CSS equivalency.

    Scenario Outline: Differences in simple nodes will fail
        Ensures inequvalent nodes should fail when compared.

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                    | Second                |
            | <div></div>              |                       |
            | <div>                    | </div>                |
            | <div></div>              | <span></span>         |
            | <div id></div>           | <div></div>           |
            | <div id=""></div>        | <div></div>           |
            | <div id="value"></div>   | <div></div>           |
            | <div>Has text</div>      | <div></div>           |
            | <div><span></span></div> | <div></div>           |
            | <!DOCTYPE html>          | <!--DOCTYPE html-->   |
            | <!DOCTYPE html>          | <?DOCTYPE html?>      |
            | <?DOCTYPE html?>         | <!--DOCTYPE html-->   |
            | <div id=id></div>        | <div id="id"></div>   |
            | <div style></div>        | <div></div>           |
            | <div style=""></div>     | <div></div>           |
            | <div style=style></div>  | <div></div>           |
            | <noscript></noscript>    | <textarea></textarea> |

    Scenario Outline: Attribute order does not matter
        Attribute order does not matter https://dom.spec.whatwg.org/#ref-for-dom-node-isequalnode%E2%91%A0

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                      | Second                     |
            | <div a b></div>            | <div b a></div>            |
            | <span a="value" b></span>  | <span b a="value"></span>  |
            | <div><h1 a b></h1></div>   | <div><h1 b a></h1></div>   |
            | <div a b><p b a></p></div> | <div b a><p a b></p></div> |

    Scenario Outline: Boolean attirbutes
        Spec: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                           | Second                       |
            | <details open></details>        | <details open=""></details>  |
            | <details open=""></details>     | <details open=""></details>  |
            | <details open=open></details>   | <details open=""></details>  |
            | <details style></details>       | <details style=""></details> |
            | <details style=""></details>    | <details style=""></details> |
            | <details style=style></details> | <details style=""></details> |

    Scenario Outline: Noscript and textarea tags content will be parsed as html elements
        Noscript and textarea are parsed by default as text, comparison should also pass with html elements

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                                              | Second                                       |
            | <noscript><div disabled=disabled></div></noscript> | <noscript><div disabled=""></div></noscript> |
            | <noscript><div a b></div></noscript>               | <noscript><div b a></div></noscript>         |
            | <textarea><div disabled=disabled></div></textarea> | <textarea><div disabled=""></div></textarea> |
            | <textarea><div a b></div></textarea>               | <textarea><div b a></div></textarea>         |

    Scenario Outline: HTML singleton tags with no closing bracket
        Closing tag should not be needed in certain html tags (e.g. <img>)
        Spec: https://html.spec.whatwg.org/multipage/syntax.html#void-elements

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                  | Second                       |
            | <img>                  | <img></img>                  |
            | <area>                 | <area></area>                |
            | <base>                 | <base></base>                |
            | <input>                | <input></input>              |
            | <embed>                | <embed></embed>              |
            | <meta>                 | <meta></meta>                |
            | <hr>                   | <hr />                       |
            | <col>                  | <col />                      |
            | <link>                 | <link />                     |
            | <source>               | <source />                   |
            | <track>                | <track />                    |
            | <wbr>                  | <wbr />                      |
            | <br>                   | </br>                        |
            | <br>                   | <br/>                        |
            | <img src="helloworld"> | <img src="helloworld"></img> |

    Scenario Outline: Extra whitespace does not matter
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                     | Second                          |
            | <div> </div>              | <div>  </div>                   |
            | <div     open   ></div>   | <div open></div>                |
            | <body><div> </div></body> | <body><div>       </div></body> |

    Scenario Outline: Whitespace does matter
        The presences of whitespace matters in certain situations because it affects text rendering.
        See: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace

        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                                 | Second                               |
            | <div>Hello <b>World</b></div>         | <div>Hello<b>World</b></div>         |
            | <span>Hello <span>World</span></span> | <span>Hello<span>World</span></span> |

    Scenario Outline: Unequivalent CSS styles will cause failures
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will not be equivalent

        Examples:
            | First                                          | Second                                     |
            | <div style="display: none; "></div>            | <div style="bold:true;"></div>             |
            | <div style="display: blue; "></div>            | <div style="bold: contents;"></div>        |
            | <div style='opacity: 0.5"></div>               | <div style="opacity: 0.5"></div>           |
            | <style> body {border: 1px solid red;} </style> | <style> body {color: blue;} </style>       |
            | <style> body {display: none;} </style>         | <style> body {DISPLAY : CONTENTS} </style> |

    Scenario Outline: Unequivalent CSS styles will ignore text differences
        Given one HTML string "<First>"
        And another HTML string "<Second>"
        Then they will be equivalent

        Examples:
            | First                                           | Second                                                        |
            | <div style="display: none;"></div>              | <div style="display:none"></div>                              |
            | <div style="display: none;"></div>              | <div style="DISPLAY: NONE;"></div>                            |
            | <div style="   display: none; "></div>          | <div style="display: none;"></div>                            |
            | <div style="opacity: 0.5"></div>                | <div style='opacity: 0.5'></div>                              |
            | <style>     body {   color:   red} </style>     | <style> body {color: red;} </style>                           |
            | <style type="text/css">body{color:red;}</style> | <style    type='text/css'  >  body  {color:   red}   </style> |
            | <style> body {display: none;} </style>          | <style> body {DISPLAY : NONE} </style>                        |
            | <style> body {/* color: red; */} </style>       | <style> body {/* color: blue; */} </style>                    |
            | <style> body {} </style>                        | <style> body {/* color: blue; */} </style>                    |