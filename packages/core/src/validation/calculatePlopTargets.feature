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
		Then calculatePlopTargets will return
			"""
			[
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
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
				}
			]
			"""


	@motivating
	Scenario: Picked parents don't allow plop in their descendents

		We can't allow anyone to become their own grandparent like Phillip J. Fry did that one time.

		Given a parent with following html
			"""
			<parent>
			<node>a<node>b<node>c</node></node></node>
			</parent>
			"""
		And parent meta has slots [{"name": ""}]
		When the parent is picked
		Then there are no plop targets anywhere

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
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
				},
				{
					"slot": "slot-other",
					"idx": 4
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
		Then calculatePlopTargets will return
			"""
			[
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
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
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
	Scenario: Parent with children in multiple slots returns all valid indexes

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
		Then calculatePlopTargets will return
			"""
			[
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
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
				},
				{
					"slot": "slot-a",
					"idx": 7
				},
				{
					"slot": "slot-a",
					"idx": 8
				},
				{
					"slot": "slot-b",
					"idx": 4
				}
			]
			"""

	@motivating
	Scenario: White space and newline characters do not create additional plop targets for the first element

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 1 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
				}
			]
			"""

	@motivating
	Scenario: White space and newline characters do not create additional plop targets for the first element with 4 nodes

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 1 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 4
				},
				{
					"slot": "",
					"idx": 6
				},
				{
					"slot": "",
					"idx": 8
				}
			]
			"""

	@motivating
	Scenario: White space and newline characters do not create additional plop targets for a middle element with 4 nodes

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 3 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 6
				},
				{
					"slot": "",
					"idx": 8
				}
			]
			"""

	@motivating
	Scenario: White space and newline characters do not create additional plop targets for the last element with 4 nodes

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 7 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 3
				},
				{
					"slot": "",
					"idx": 5
				}
			]
			"""




	@motivating
	Scenario: White space and newline characters do not create additional plop targets for the middle element

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 3 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 6
				}
			]
			"""

	@motivating
	Scenario: White space and newline characters do not create additional plop targets for the last element

		Given a parent with following html
			"""
			<parent>\n
			<node></node>\n
			<node></node>\n
			<node></node>\n
			</parent>
			"""
		And plop is child at position 5 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 1
				},
				{
					"slot": "",
					"idx": 3
				}
			]
			"""

	@motivating
	Scenario: Randomly ordered nodes and newlines do not break plop targets for the first element

		Given a parent with following html
			"""
			<parent>
			<node></node><node></node>
			<node></node>
			</parent>
			"""
		And plop is child at position 1 of parent
		And parent meta has slots [{"name": ""}]
		Then calculatePlopTargets will return
			"""
			[
				{
					"slot": "",
					"idx": 3
				},
				{
					"slot": "",
					"idx": 5
				}
			]
			"""

