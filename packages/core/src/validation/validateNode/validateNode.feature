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


