Feature: Validate Node

	Node validation specifications

	@motivating
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

	@motivating
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

	@motivating
	Scenario Outline: Enum validation is handled for all node types
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

	@motivating
	Scenario Outline: Min length and max length validation applies to string types
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

	@motivating
	Scenario Outline: Min length and max length validation does not apply to non string types
		Given a meta list
		And it has attribute
		And name is prop
		And type is <type>
		And minLength is 3
		And maxLength is 5
		And a parsed <node>
		Then no validation error is received
		Examples:
			| type    | node                   |
			| boolean | <div>                  |
			| boolean | <div prop="hi">        |
			| boolean | <div prop="hey">       |
			| boolean | <div prop="heyo">      |
			| boolean | <div prop="hello">     |
			| boolean | <div prop="greetings"> |
			| number  | <div>                  |
			| number  | <div prop="1">         |
			| number  | <div prop="123">       |
			| number  | <div prop="12345">     |
			| number  | <div prop="123456789"> |

	@motivating
	Scenario Outline: Maximum and minimum validation applies to number types
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

	@motivating
	Scenario Outline: Maximum and minimum validation does not apply to non number types
		Given a meta list
		And it has attribute
		And name is prop
		And type is <type>
		And minimum is 5
		And maximum is 10
		And a parsed <node>
		Then no validation error is received
		Examples:
			| type    | node            |
			| string  | <div>           |
			| string  | <div prop="0">  |
			| string  | <div prop="5">  |
			| string  | <div prop="8">  |
			| string  | <div prop="10"> |
			| string  | <div prop="11"> |
			| boolean | <div>           |
			| boolean | <div prop="0">  |
			| boolean | <div prop="5">  |
			| boolean | <div prop="8">  |
			| boolean | <div prop="10"> |
			| boolean | <div prop="11"> |

	@motivating
	Scenario Outline: Number type validation is handled
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

	@motivating
	Scenario Outline: Boolean type validation is handled
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
	Scenario Outline: Required validation is handled on all types
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
	Scenario Outline: Required validation does not return errors for booleans
		Given a meta list
		And it has attribute
		And name is center
		And type is boolean
		And required is <required>
		And a parsed <node>
		Then no validation error is received
		Examples:
			| node                        | required |
			| <div>                       | true     |
			| <div>                       | false    |
			| <div center>                | true     |
			| <div center>                | false    |
			| <div center="">             | true     |
			| <div center="">             | false    |
			| <div center="1">            | true     |
			| <div center="1">            | false    |
			| <div center="hello world!"> | true     |
			| <div center="hello world!"> | false    |

	@minutiae
	Scenario Outline: String required validation for empty strings
		Given a meta list
		And it has attribute
		And name is center
		And type is string
		And required is true
		And a parsed <node>
		Then <rule> validation error is received
		Examples:
			| node                        | rule     |
			| <div>                       | required |
			| <div center>                | no       |
			| <div center="">             | no       |
			| <div center="hello world!"> | no       |

@motivating
Scenario Outline: Format validation for URL for string types
	Given an input value of <url>	
	When isValidURL is tested
	Then it returns true
	Examples:
		| url                               |
		| //www.saasquatch.com              |
		| http://www.saasquatch.com         |
		| https://www.saasquatch.com        |
		| https://www.saasquatch.com/about/ |

@motivating
Scenario Outline: URL validation does not accept bad strings
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

@landmine
Scenario Outline: Format validation for date interval should accept ISO 8601 dates
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

@motivating
Scenario Outline: Invalid date intervals should be rejected
	Given an input value of <date>
	When isValidDateInterval is tested
	Then it returns false
	Examples:
		| date                                                |
		| 2024-04-20T12:00:00+08:00/2022-04-20T12:00:00+08:00 |
		| 2022-04-20T12:00:00+08:00                           |
		| 2022-04-20T12:00:00                                 |
		| 2022-04-20                                          |
		| 2022-04-20T12:00:00+08:00/                          |
		| /2022-04-20T12:00:00+08:00                          |
		| P1Y2M10DT2H30M/P1Y2M10DT2H30M                       |
		| P1Y2M10DT2H30M                                      |

@minutiae
Scenario Outline: Valid color test should pass css keywords
	Given an input value of <keyword>
	When isValidColor is tested
	Then it returns true
	Examples:
		| keyword      |
		| currentColor |
		| currentcolor |

@minutiae
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

@motivating
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

@motivating
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

@minutiae
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

@minutiae
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

@motivating
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