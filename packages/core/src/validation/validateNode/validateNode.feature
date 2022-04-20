Feature: Validate Node

	# Node validation specifications

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


	Scenario Outline: Validate attributes handles enums
		Given a meta list
		And it has attribute
		And name is prop
		And type is <type>
		And enum is <enum>
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| type    | enum              | node                | rule         |
			| string  | ["left", "right"] | <div>               | no           |
			| string  | ["left", "right"] | <div prop="left">   | no           |
			| string  | ["left", "right"] | <div prop="right">  | no           |
			| string  | ["left", "right"] | <div prop="center"> | enum/string  |
			| number  | [0, 1]            | <div>               | no           |
			| number  | [0, 1]            | <div prop="0">      | no           |
			| number  | [0, 1]            | <div prop="1">      | no           |
			| number  | [0, 1]            | <div prop="2">      | enum/number  |
			| boolean | ["true", "false"] | <div>               | no           |
			| boolean | ["true", "false"] | <div prop="true">   | no           |
			| boolean | ["true", "false"] | <div prop="false">  | no           |
			| boolean | ["true", "false"] | <div prop="maybe">  | enum/boolean |

	Scenario Outline: Validate attributes handles string minLength and maxLength
		Given a meta list
		And it has attribute
		And name is prop
		And type is string
		And minLength is 3
		And maxLength is 5
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| node                   | rule      |
			| <div>                  | no        |
			| <div prop="hi">        | minLength |
			| <div prop="hey">       | no        |
			| <div prop="heyo">      | no        |
			| <div prop="hello">     | no        |
			| <div prop="greetings"> | maxLength |

	Scenario Outline: Validate attributes handles number minimum and maximum
		Given a meta list
		And it has attribute
		And name is prop
		And type is number
		And minimum is 5
		And maximum is 10
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| node            | rule    |
			| <div>           | no      |
			| <div prop="0">  | minimum |
			| <div prop="5">  | no      |
			| <div prop="8">  | no      |
			| <div prop="10"> | no      |
			| <div prop="11"> | maximum |

	Scenario Outline: Validate attributes handles number types
		Given a meta list
		And it has attribute
		And name is age
		And type is number
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| node              | rule        |
			| <div>             | no          |
			| <div age>         | type/number |
			| <div age="">      | type/number |
			| <div age="hello"> | type/number |
			| <div age="10">    | no          |

	Scenario Outline: Validate attributes handles boolean types
		Given a meta list
		And it has attribute
		And name is center
		And type is boolean
		And a parsed <node>
		Then no validation error is received
		Examples:
			| node                 |
			| <div>                |
			| <div center>         |
			| <div center="">      |
			| <div center="true">  |
			| <div center="false"> |
			| <div center="123">   |
			| <div center="any">   |

	@landmine
	Scenario Outline: Validate attributes handles required
		Given a meta list
		And it has attribute
		And name is id
		And type is <type>
		And required is true
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| type    | node           | rule     |
			| string  | <div>          | required |
			| number  | <div>          | required |
			| boolean | <div>          | no       |
			| string  | <div id="pw">  | no       |
			| number  | <div id="123"> | no       |
			| boolean | <div id>       | no       |

	@landmine
	Scenario Outline: Validate attributes required does not affect booleans
		Given a meta list
		And it has attribute
		And name is center
		And type is boolean
		And required is <required>
		And a parsed <node>
		Then no validation error is received
		Examples:
			| node         | required |
			| <div>        | true     |
			| <div>        | false    |
			| <div center> | true     |
			| <div center> | false    |

	Scenario Outline: Valid url should accept valid links
		Given an input value of <url>
		When isValidURL is tested
		Then it returns true
		Examples:
			| url                               |
			| http://www.saasquatch.com         |
			| https://www.saasquatch.com        |
			| https://www.saasquatch.com/about/ |

	Scenario Outline: Valid url should not accept invalid links
		Given an input value of <url>
		When isValidURL is tested
		Then it returns false
		Examples:
			| url                |
			| saasquatch.com     |
			| www.saasquatch.com |
			| localhost:3000     |
			| example/com        |
			| example            |

	Scenario Outline: Valid date interval test should accept ISO dates
		Given an input value of <date>
		When isValidDateInterval is tested
		Then it returns true
		Examples:
			| date                                                |
			| 2007-03-01T13:00:00Z/2008-05-11T15:30:00Z           |
			| 2007-03-01T13:00:00Z/P1Y2M10DT2H30M                 |
			| P1Y2M10DT2H30M/2008-05-11T15:30:00Z                 |
			| 2022-04-20T12:00:00+08:00/2022-04-20T12:00:00+08:00 |
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
			| P1Y2M10DT2H30M             |

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