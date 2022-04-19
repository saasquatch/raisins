Feature: Validate Node

	Node validation specifications

	Scenario Outline: Non element nodes return no errors
		Given a <nonElement> node
		And a meta list
		Then no error is returned

		Examples:
			| nonElement |
			| root       |
			| text       |
			| style      |
			| comment    |
			| directive  |


	Scenario Outline: Appropriate error handling is done for element nodes
		Given a parent node of type element
		And it has a child of type element
		And a meta list
		And it includes a parent meta that <hasRelationshipTo1> child
		And it includes a child meta that <hasRelationshipTo2> parent
		Then <rule> error is returned

		Examples:
			| hasRelationshipTo1 | hasRelationshipTo2 | rule                 |
			| allows             | does not allow     | doesChildAllowParent |
			| does not allow     | allows             | doesParentAllowChild |
			| allows             | allows             | no                   |
			| does not allow     | does not allow     | doesChildAllowParent |


	# URL TEST SUITE

	Scenario Outline: Valid url should accept valid links
		Given an input value of <url>
		When isValidURL is tested
		Then it returns true
		Examples:
			| url                        |
			| saasquatch.com             |
			| www.saasquatch.com         |
			| http://www.saasquatch.com  |
			| https://www.saasquatch.com |

	Scenario Outline: Valid url should not accept invalid links
		Given an input value of <url>
		When isValidURL is tested
		Then it returns false
		Examples:
			| url            |
			| localhost:3000 |
			| example/com    |
			| example        |


	# DATE TEST SUITE

	Scenario Outline: Valid date test should accept ISO dates
		Given an input value of <date>
		When isValidDate is tested
		Then it returns true
		Examples:
			| date                      |
			| 2022-04-20T12:00:00+08:00 |
			| 2022-04-20T12:00:00       |
			| 2022-04-20                |


	Scenario Outline: Valid date test should not accept bad dates
		Given an input value of <date>
		When isValidDate is tested
		Then it returns false
		Examples:
			| date        |
			| purple      |
			| example.com |
			| 12px        |


	# DATE INTERVAL TEST SUITE

	Scenario Outline: Valid date interval test should accept ISO dates
		Given an input value of <date>
		When isValidDateInterval is tested
		Then it returns true
		Examples:
			| date                                                |
			| 2022-04-20T12:00:00+08:00/2022-04-20T12:00:00+08:00 |
			| 2022-04-20T12:00:00/2022-04-20T12:00:00             |
			| 2022-04-20/2022-04-20                               |

	Scenario Outline: Valid date interval test should not accept bad dates
		Given an input value of <date>
		When isValidDateInterval is tested
		Then it returns false
		Examples:
			| date                       |
			| 2022-04-20T12:00:00+08:00  |
			| 2022-04-20T12:00:00        |
			| 2022-04-20                 |
			| 2022-04-20T12:00:00+08:00/ |
			| /2022-04-20T12:00:00+08:00 |


	# COLOR TEST SUITE

	Scenario Outline: Valid color test should pass css keywords
		Given an input value of <keyword>
		When isValidColor is tested
		Then it returns true
		Examples:
			| keyword      |
			| currentColor |
			| currentcolor |

	Scenario Outline: Valid color test should pass css color names
		Given an input value of <color>
		When isValidColor is tested
		Then it returns true
		Examples:
			| color         |
			| red           |
			| orange        |
			| tan           |
			| rebeccapurple |

	Scenario Outline: Valid color test should accept hex color values
		Given an input value of <hex>
		When isValidColor is tested
		Then it returns true
		Examples:
			| hex       |
			| #090      |
			| #009900   |
			| #090a     |
			| #009900aa |

	Scenario Outline: Valid color test should accept rgb values
		Given an input value of <rgb>
		When isValidColor is tested
		Then it returns true
		Examples:
			| rgb                   |
			| rgb(34, 12, 64)       |
			| rgb(34, 12, 64, 0.6)  |
			| rgba(34, 12, 64)      |
			| rgba(34, 12, 64, 0.6) |

	Scenario Outline: Valid color test should accept hsl values
		Given an input value of <hsl>
		When isValidColor is tested
		Then it returns true
		Examples:
			| hsl                      |
			| hsl(30, 100%, 50%)       |
			| hsl(30, 100%, 50%, 0.6)  |
			| hsla(30, 100%, 50%)      |
			| hsla(30, 100%, 50%, 0.6) |

	Scenario Outline: Valid color test should allow shoelace color variables
		Given an input value of <shoelace>
		When isValidColor is tested
		Then it returns true
		Examples:
			| shoelace                     |
			| var(--sl-color-red-400)      |
			| var(--sl-color-orange-50)    |
			| var(--sl-color-danger-100)   |
			| var(--sl-color-success-500)  |
			| var(--sl-color-warning-950)  |
			| var(--sl-color-neutral-1000) |
			| var(--sl-color-neutral-0)    |

	Scenario Outline: Valid color test should fail on invalid color values
		Given an input value of <invalid>
		When isValidColor is tested
		Then it returns false
		Examples:
			| invalid                 |
			| 2rem                    |
			| 16px                    |
			| #ff                     |
			| #ggg                    |
			| I like trutles          |
			| var(--sl-spacing-large) |