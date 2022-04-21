Feature: Selecting by CSS selectors

	Raisin supports finding nodes in the document using CSS selectors.

	@motivating
	Scenario Outline: Tag selectors
		Based on tag type https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors

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

	@motivating
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

	@motivating
	Scenario Outline: Attribute
		Attribute ([attr=foo]), with supported comparisons https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
		[attr] (existential)
		=       ~=         |=        *=        ^=        $=        !=
		Also, i can be added after the comparison to make the comparison case-insensitive (eg. [attr=foo i])

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


	@motivating
	Scenario Outline: Descendant selectors
		Descendant ( ) https://developer.mozilla.org/en-US/docs/Web/CSS/Descendant_combinator
		Child (>) https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator

		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                             | Selector        | JSONata                      |
			| <div><span>Inner<span></div>     | span            | node.children[0].children[0] |
			| <div><span>Inner<span></div>     | div span        | node.children[0].children[0] |
			| <div><span>Inner<span></div>     | div > span      | node.children[0].children[0] |
			| <div><span foo>Inner<span></div> | div > span[foo] | node.children[0].children[0] |


	@motivating
	Scenario Outline: Wildcard selector
		Universal selector https://developer.mozilla.org/en-US/docs/Web/CSS/Universal_selectors

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

	@motivating
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

	@motivating
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
			| <div></div><div></div>         | div + div  |
			| <div>one</div><div>two</div>   | div + div  |
			| <div>one</div><div>two</div>   | div ~ div  |
			| <span>one</span><div>two</div> | span + div |
			| <span>one</span><div>two</div> | span ~ div |

	@motivating
	Scenario Outline: Match multiple tags selectors
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "node.children"

		Examples:
			| HTML                     | Selector |
			| <div>I am a div</div>    | div      |
			| <span>I am a span</span> | span     |
			| <h1>I am an h1</h1>      | h1       |
			| <b>I am an b</b>         | b        |

	@motivating
	Scenario Outline: Pseudo-classes selectors
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "undefined"

		Examples:
			| HTML                     | Selector    |
			| <div>I am a div</div>    | div:hover   |
			| <span>I am a span</span> | span:active |
			| <h1>I am an h1</h1>      | h1:visited  |
			| <b>I am an b</b>         | b:link      |

	@motivating
	Scenario Outline: Pseudo contains selector
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                       | Selector             | JSONata                      |
			| <div></div>                | div:contains('Solo') | undefined                    |
			| <div>Princess Leia</div>   | div:contains('Solo') | undefined                    |
			| <div>Han Solo</div>        | div:contains('Solo') | node.children[0]             |
			| <div><b>Han Solo</b></div> | div:contains('Solo') | node.children[0]             |
			| <div><b>Han Solo</b></div> | b:contains('Solo')   | node.children[0].children[0] |
			| <div><b>Chewbaca</b></div> | b:contains('Solo')   | undefined                    |

	@motivating
	Scenario Outline: Nth-child selector
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                                    | Selector        | JSONata          |
			| <ul><li>1</li><li>2</li><li>3</li></ul> | ul:nth-child(1) | node.children[0] |
			| <ul><li>1</li><li>2</li><li>3</li></ul> | ul:nth-child(2) | node.children[1] |
			| <ul><li>1</li><li>2</li><li>3</li></ul> | ul:nth-child(3) | node.children[1] |

	@motivating
	Scenario Outline: Pseudo input enabled/disabled selectors
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                     | Selector       | JSONata          |
			| <input></input>          | input:enabled  | node.children[0] |
			| <input disabled></input> | input:enabled  | undefined        |
			| <input></input>          | input:disabled | undefined        |
			| <input disabled></input> | input:disabled | node.children[0] |


	@motivating
	Scenario Outline: Pseudo input required/optional selectors
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                     | Selector       | JSONata          |
			| <input></input>          | input:required | undefined        |
			| <input required></input> | input:required | node.children[0] |
			| <input></input>          | input:required | undefined        |
			| <input required></input> | input:optional | undefined        |
			| <input optional></input> | input:optional | node.children[0] |
			| <input></input>          | input:optional | node.children[0] |


	@motivating
	Scenario Outline: Pseudo input type selectors
		Given an html document
			"""
			<HTML>
			"""
		When we select "<Selector>"
		Then it should return "<JSONata>"

		Examples:
			| HTML                            | Selector       | JSONata          |
			| <input></input>                 | input:text     | node.children[0] |
			| <input></input>                 | input:radio    | undefined        |
			| <input></input>                 | input:button   | undefined        |
			| <input></input>                 | input:checkbox | undefined        |
			| <input></input>                 | input:password | undefined        |
			| <input></input>                 | input:file     | undefined        |
			| <input type="text"></input>     | input:text     | node.children[0] |
			| <input type="radio"></input>    | input:radio    | node.children[0] |
			| <input type="button"></input>   | input:button   | node.children[0] |
			| <input type="checkbox"></input> | input:checkbox | node.children[0] |
			| <input type="password"></input> | input:password | node.children[0] |
			| <input type="file"></input>     | input:file     | node.children[0] |


