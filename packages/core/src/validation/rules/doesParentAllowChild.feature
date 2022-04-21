Feature: Does Parent Allow Child

	From a tag's metadata, checks if it allows children.

	@motivating
	Scenario Outline: Parent without slots does not allow child
		Given a parent meta
			"""
			{
				"tagName": ""
			}
			"""
		And a node of <type>
		Then parent does not allow node as child

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
				"tagName": "",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And a node of <type>
		Then parent does not allow node as child

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
				"tagName": "",
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
		Then parent allows node as child


	@motivating
	Scenario: Parent allows child element when there are no constraints on its valid children
		Given a parent meta
			"""
			{
				"tagName": "",
				"slots": [
					{
						"name": "child"
					}
				]
			}
			"""
		And a node of element
		Then parent allows node as child


	@motivating
	Scenario Outline: Parent allows child when its slots have constraints and matches child's tagname
		Given a parent meta
			"""
			{
				"tagName": "",
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
		Then parent allows node as child

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
				"tagName": "",
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
		Then parent does not allow node as child

		Examples:
			| tagName1 | tagName2 |
			| div      | span     |
			| span     | div      |
			| h1       | h3       |
			| b        | h3       |
			| p        | h3       |