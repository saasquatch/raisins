Feature: Is Node Allowed

	From two nodes and their metadata checks two sides of relationship: parent allows child and child allows parent.

	@motivating
	Scenario: Node is allowed when both parent allows child and child allows parent
		Given a parent node with meta
		And a child node with meta
		And parent allows child
		And child allows parent
		Then node is allowed

	@motivating
	Scenario: Node is not allowed if child does not allow parent
		Given a parent node with meta
		And a child node with meta
		But parent allows child
		But child does not allow parent
		Then node is not allowed

	@motivating
	Scenario: Node is not allowed if parent does not allow child
		Given a parent node with meta
		And a child node with meta
		And child allows parent
		But parent does not allow child
		Then node is not allowed

	@motivating
	Scenario: Node is not allowed if neither parent allows child nor child allows parent
		Given a parent node with meta
		And a child node with meta
		And parent does not allow child
		And child does not allow parent
		Then node is not allowed
