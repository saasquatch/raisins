Feature: Does Parent Allow Child

	From a tag's metadata, checks if it allows children.

	Scenario Outline: Parent without slots does not allow child
		Given a parent meta
			"""
			{
			tagName: "",
			}
			"""
		And a <node>
		Then parent does not allow child

		Examples:
			| node      |
			| root      |
			| text      |
			| style     |
			| element   |
			| comment   |
			| directive |

	Scenario Outline: Parent does not allow child if child is not an element node
		Given a parent meta
			"""
			{
			tagName: "",
			slots: [{ name: "child" }]
			}
			"""
		And a <node>
		Then parent does not allow child

		Examples:
			| node      |
			| text      |
			| style     |
			| comment   |
			| directive |

	Scenario: Parent allows child element when its slot specifies * as valid children
		Given a parent meta
			"""
			{
			tagName: "",
			slots: [{ name: "child", validChildren: ["*"] }]
			}
			"""
		And an element node
		Then parent allows child


	Scenario: Parent allows child element when there are no constraints on its valid children
		Given a parent meta
			"""
			{
			tagName: "",
			slots: [{ name: "child" }]
			}
			"""
		And an element node
		Then parent allows child


	Scenario Outline: Parent allows child when its slots have constraints and matches child's tagname
		Given a parent meta
		And validChildren has <tagName>
		And an element node
		And node has <tagName>
		Then parent allows node as child

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |

	Scenario Outline: Parent does not allow child if its slot constraints does not match child's tagname
		Given a parent meta
		And validChildren has <tagName1>
		And an element node
		And node has <tagName2>
		Then parent does not allow node as child

		Examples:
			| tagName1 | tagName2 |
			| div      | span     |
			| span     | div      |
			| h1       | h3       |
			| b        | h3       |
			| p        | h3       |