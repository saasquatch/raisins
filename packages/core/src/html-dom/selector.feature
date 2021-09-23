Feature: Selecting by CSS selectors

    Raisin supports finding nodes in the document using CSS selectors.

    Scenario Outline: Tag selectors
        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "node.children[0]"

        Examples:
            | HTML                     | Selector |
            | <div>I am a div</div>    | div      |
            | <span>I am a span</span> | span     |
            | <h1>I am an h1</h1>      | h1       |
            | <b>I am an b</b>         | b        |

    Scenario Outline: Class selectors
        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "<JSONata>"

        Examples:
            | HTML                                  | Selector | JSONata          |
            | <div class="foo">I am a div</div>     | .foo     | node.children[0] |
            | <div class="boo">I am a div</div>     | .foo     | undefined        |
            | <div class="foo too">I am a div</div> | .foo     | node.children[0] |
            | <div class="boo too">I am a div</div> | .foo     | undefined        |
            | <div class="foo-too">I am a div</div> | .foo-too | node.children[0] |
            | <div class="boo-too">I am a div</div> | .foo-too | undefined        |

    Scenario Outline: Attribute
        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "<JSONata>"

        Examples:
            | HTML                                   | Selector    | JSONata          |
            | <div foo>I am a div</div>              | [foo]       | node.children[0] |
            | <div foo>I am a div</div>              | [fart]      | undefined        |
            | <div foo="fart">I am a div</div>       | [foo=fart]  | node.children[0] |
            | <div foo>I am a div</div>              | [fart=fart] | undefined        |
            | <div foo="fart">I am a div</div>       | [foo!=tart] | node.children[0] |
            | <div foo="tart">I am a div</div>       | [foo!=tart] | undefined        |
            | <div foo="one two">I am a div</div>    | [foo~=two]  | node.children[0] |
            | <div foo="three four">I am a div</div> | [foo~=two]  | undefined        |


    Scenario Outline: Nested selectors
        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "<JSONata>"

        Examples:
            | HTML                         | Selector | JSONata                      |
            | <div><span>Inner<span></div> | span     | node.children[0].children[0] |


    Scenario Outline: Wildcard selector
        Given an html document
            """
            <HTML>
            """
        When we select "*"
        Then it should return "node.children[0]"

        Examples:
            | HTML                     |
            | <div>I am a div</div>    |
            | <span>I am a span</span> |
            | <h1>I am an h1</h1>      |
            | <b>I am an b</b>         |

    Scenario Outline: Selector lists
        Multiple selectors in the same selector https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list

        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "node.children[0]"

        Examples:
            | HTML                     | Selector  |
            | <div>I am a div</div>    | div, span |
            | <span>I am a span</span> | div, span |
            | <h1>I am an h1</h1>      | h1, b     |
            | <b>I am an b</b>         | h1, b     |

    Scenario Outline: Sibling selectors
        General (~) siblings selectors https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator
        Adjacent (+) siblings selectors https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator

        Given an html document
            """
            <HTML>
            """
        When we select "<Selector>"
        Then it should return "node.children[1]"

        Examples:
            | HTML                           | Selector   |
            | <div>one</div><div>two</div>   | div + div  |
            | <div>one</div><div>two</div>   | div ~ div  |
            | <span>one</span><div>two</div> | span + div |
            | <span>one</span><div>two</div> | span ~ div |