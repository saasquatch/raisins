Feature: Util Functions

	Utility function tests

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
