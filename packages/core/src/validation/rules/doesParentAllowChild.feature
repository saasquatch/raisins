Feature: Does Parent Allow Child

	From a tag's metadata, checks if it allows children.

	@motivating
	Scenario Outline: Parent without slots does not allow child
		Given a parent meta
			"""
			{
				"tagName": "my-example"
			}
			"""
		And a node of <type>
		Then parent does not allow node as child in the "child" slot

		Examples:
			| type        |
			| root        |
			| text        |
			| style       |
			| element     |
			| comment     |
			| instruction |

	@motivating
	Scenario Outline: Parent does not allow child if child is not an element node
		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And a node of <type>
		Then parent does not allow node as child in the "child" slot

		Examples:
			| node        |
			| text        |
			| style       |
			| comment     |
			| instruction |

	@motivating
	Scenario: Parent allows child element when its slot specifies * as valid children
		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": [
					{
						"name": "child",
						"validChildren": [
							"*"
						]
					}
				]
			}
			"""
		And a node of element
		Then parent allows node as child in the "child" slot


	@motivating
	Scenario: Parent allows child element when there are no constraints on its valid children
		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And a node of element
		Then parent allows node as child in the "child" slot


	@motivating
	Scenario Outline: Parent allows child when its slots have constraints and matches child's tagname
		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And validChildren has <tagName>
		And a node of element
		And node has <tagName>
		Then parent allows node as child in the "child" slot

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |

	@motivating
	Scenario Outline: Parent does not allow child if its slot constraints does not match child's tagname
		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And validChildren has <tagName1>
		And a node of element
		And node has <tagName2>
		Then parent does not allow node as child in the "child" slot

		Examples:
			| tagName1 | tagName2 |
			| div      | span     |
			| span     | div      |
			| h1       | h3       |
			| b        | h3       |
			| p        | h3       |


	@motivating
	Scenario Outline: Parent allows children in it's default slot
		This is how most built-in html elements should behave.

		Given a parent meta
			"""
			{
				"tagName": "div",
				"slots": [
					{
						"name": ""
					}
				]
			}
			"""
		And a node of element
		And node has <tagName2>
		Then parent allows node as child in the default slot
		And parent allows node as child in the "" slot

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |

	@motivating
	Scenario Outline: Parents don't allow children in their it's default slot by default
		This is how leaf custom components will behave

		Given a parent meta
			"""
			{
				"tagName": "my-example",
				"slots": []
			}
			"""
		And a node of element
		And node has <tagName2>
		Then parent does not allow node as child in the default slot
		And parent does not allow node as child in the "" slot

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |