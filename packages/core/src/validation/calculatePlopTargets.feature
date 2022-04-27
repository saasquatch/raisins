Feature: Calculate Plop Targets

	From a parent, calculates the available slot targets to place a node to

	@motivating
	Scenario Outline: Scenario name

		Given following html
			"""
			<parent>
			</parent>
			"""
		And parent has a slot for <slots>
		And a plop target with a slot at <slot>
		And and a schema
		Then calculatePlopTargets will return <number> targets
			"""

			"""

		Examples:
			| slots                          | slot |
			| [{"name": ""}]                 |      |
			| [{"name": "a"}, {"name": "b"}] | a    |

	@motivating
	Scenario: Single slot empty parent case

		Given a parent with following html
			"""
			<parent>
			</parent>
			"""
		And an outside plop target
		And plop meta has slot
		And parent meta has slot
		And and a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				}
			]
			"""

		Examples:
			| slots                          | slot |
			| [{"name": ""}]                 |      |
			| [{"name": "a"}, {"name": "b"}] | a    |