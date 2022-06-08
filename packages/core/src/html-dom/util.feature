Feature: Util Functions

	Utility function tests

	@motivating
	Scenario: Remove whitespace
		DOM Whitespace https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace

		Given a raisin node with html
			"""
			<div>
			<div>
			I am a div
			</div>
			</div>
			"""
		When we run removeWhitespace on raisin node
		Then it should return html "<div><div>I am a div</div></div>"

	@motivating
	Scenario Outline: Visit
		Given the node is <type>
		And the visitor has a <callback> function defined
		When visit is called
		Then the callback is called with the node
		And the <result> of the callback is returned

		Examples:
			| type      | callback    | result      |
			| text      | onText      | r_text      |
			| directive | onDirective | r_directive |
			| comment   | onComment   | r_comment   |
			| tag       | onElement   | r_tag       |
			| style     | onStyle     | r_style     |
			| root      | onRoot      | r_root      |

