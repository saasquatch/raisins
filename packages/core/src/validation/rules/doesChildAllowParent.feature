Feature: Does Child Allow Parent

	From a tag's metadata, checks if it allows parent.

	Scenario: Child allows root element as parent
		Given a child meta
			"""
			{
			tagName: "",
			}
			"""
		And a root node
		Then child allows node as parent

	Scenario Outline: Child allows all non element as parents
		Given a child meta
			"""
			{
			tagName: "",
			}
			"""
		And a <node>
		Then child allows <node> as parent

		Examples:
			| node      |
			| text      |
			| style     |
			| comment   |
			| directive |

	Scenario Outline: Child without constraints allows parents
		Given a child meta
			"""
			{
			tagName: "",
			validParents: undefined
			}
			"""
		And a <node>
		Then child allows node as parent

		Examples:
			| node      |
			| root      |
			| text      |
			| style     |
			| element   |
			| comment   |
			| directive |


	Scenario Outline: Child with * constraint allows parents
		Given a child meta
			"""
			{
			tagName: "",
			validParents: ["*"]
			}
			"""
		And a <node>
		Then child allows node as parent

		Examples:
			| node      |
			| root      |
			| text      |
			| style     |
			| element   |
			| comment   |
			| directive |


	Scenario Outline: Child with constraints allows parent element with matching tagname
		Given a child meta
		And validParents has <tagName>
		And an element node
		And node has <tagName>
		Then child allows node as parent

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |

	Scenario Outline: Child with constraints does not allow parent element without matching tagname
		Given a child meta
		And validParents has <tagName1>
		And an element node
		And node has <tagName2>
		Then child does not allow node as parent

		Examples:
			| tagName1 | tagName2 |
			| div      | span     |
			| span     | div      |
			| h1       | h3       |
			| b        | h3       |
			| p        | h3       |

	Scenario Outline: Child with constraints does not allow parent element without tagname
		Given a child meta
		And validParents has <tagName>
		And an element node
		And node has no tagName
		Then child does not allow node as parent

		Examples:
			| tagName |
			| div     |
			| span    |
			| h1      |
			| b       |
			| p       |
