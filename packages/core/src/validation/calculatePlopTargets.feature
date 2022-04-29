Feature: Calculate Plop Targets

	From a parent, calculates the available slot targets to place a node to

	@motivating
	Scenario: Empty parent with a single slot returns a single index for a plop

		Given a parent with following html
			"""
			<parent>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": ""}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				}
			]
			"""

	@motivating
	Scenario: No index is returned from empty parent if plop is not allowed as child

		Given a parent with following html
			"""
			<parent>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": "", "validChildren": "none"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[]
			"""

	@motivating
	Scenario: Multiple indexes are returned from empty parent when it has multiple slots

		Given a parent with following html
			"""
			<parent>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": "a"}, {"name": "b"}, {"name": "c"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"idx": 0,
					"slot": "a"
				},
				{
					"idx": 0,
					"slot": "b"
				},
				{
					"idx": 0,
					"slot": "c"
				}
			]
			"""

	@motivating
	Scenario: No indexes for slots are returned from empty parent where the plop is not a valid children

		Given a parent with following html
			"""
			<parent>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": "a", "validChildren": "none"}, {"name": "b"}, {"name": "c", "validChildren": "none"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"idx": 0,
					"slot": "b"
				}
			]
			"""


	@motivating
	Scenario: Parent with children returns all indexes for outside plop

		Given a parent with following html
			"""
			<parent>
			<node></node>
			<node></node>
			<node></node>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": ""}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				},
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 2
				},
				{
					"slot": "",
					"idx": 3
				}
			]
			"""

	@motivating
	Scenario Outline: Indexes around the plop target are not returned

		Given a parent with following html
			"""
			<parent>
			<node></node>
			<node></node>
			<node></node>
			</parent>
			"""
		And plop is child at position <index> of parent
		And parent meta has slots [{"name": ""}]
		And a schema
		Then calculatePlopTargets will return <result>

		Examples:
			| index | result                                        |
			| 0     | [{"slot": "","idx": 2},{"slot": "","idx": 3}] |
			| 1     | [{"slot": "","idx": 0},{"slot": "","idx": 3}] |
			| 2     | [{"slot": "","idx": 0},{"slot": "","idx": 1}] |

	@motivating
	Scenario: Indexes around the plop target are not returned (last position + additional slot)

		Given a parent with following html
			"""
			<parent>
			<node></node>
			<node></node>
			<node></node>
			</parent>
			"""
		And plop is child at position 2 of parent
		And parent meta has slots [{"name": ""}, {"name": "slot-other"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				},
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "slot-other",
					"idx": 3
				}
			]
			"""


	@motivating
	Scenario: Parent with children and multiple slots returns indexes in other slots

		Given a parent with following html
			"""
			<parent>
			<node></node>
			<node></node>
			<node></node>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": ""}, {"name": "slot-a"}, {"name": "slot-b"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				},
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 2
				},
				{
					"slot": "",
					"idx": 3
				},
				{
					"slot": "slot-a",
					"idx": 3
				},
				{
					"slot": "slot-b",
					"idx": 3
				}
			]
			"""

	@motivating
	Scenario: Parent with children in multiple slots returns all indexes

		Given a parent with following html
			"""
			<parent>
			<node></node>
			<node></node>
			<node></node>
			<node slot="slot-a"></node>
			</parent>
			"""
		And an outside plop target
		And parent meta has slots [{"name": ""}, {"name": "slot-a"}, {"name": "slot-b"}]
		And a schema
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 0
				},
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 2
				},
				{
					"slot": "",
					"idx": 3
				},
				{
					"slot": "slot-a",
					"idx": 3
				},
				{
					"slot": "slot-a",
					"idx": 4
				},
				{
					"slot": "slot-b",
					"idx": 4
				}
			]
			"""
