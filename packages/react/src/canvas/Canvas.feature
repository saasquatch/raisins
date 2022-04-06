Feature: Auto rendering canvas

    The useCanvas hook automatically renders changes to the model to a sandboxed iframe.

    Rule: Canvas is sandboxed
        This protects admins from malicious scripts in widgets being able to
        performing attacks when the page is loaded or interacted with.

        This addresses SaaSquatch penetration testing findings where
        malicious scripts in widgets can use admin's cookies to make
        API calls that they shouldn't be able to.

        Scenario: Sandbox prevents cookie access
            Cookies should be blocked on all API requests

            Given a malicious module is loaded into the canvas
            When if it posts to a protected API
                """
                fetch("/api")
                """
            Then cookies are not included
            And the request to the server

        Scenario: Sandbox prevents alerts
            Given a malicious module is loaded into the canvas
            And it creates an alert
                """
                alert("I am malicious")
                """
            Then the alert will not be shown

    Rule: Canvas items can be selected
        The canvas propogates click events, and uses them to set selected items.

        Example: Click an element selects it
            Given a div is rendered
            When it is clicked on the canvas
            Then it is selected

        Example: Clicking inside a component's rendered content selects it
            This also means that rendered content is "unselectable" by default

            Given a web component is rendered
            And it renders a deep shadow tree
            When a deep element in the tree is clicked
            Then the web component is selected

    Rule: Canvas can have dependencies changed
        Since dependecies can be scripts, they can contain global state that
        won't update if the script is just re-loaded. To accomodate the
        assumption that dependecies are "loaded only once", the canvas
        will fully reload when dependecies are changed.

        @landmine
        Example: Stateful components are lost on update
            This is undesirable but unavoidable because we need to allow
            scripts to be reloaded for safety.
            Given a "<details>" element is rendered
            And it is clicked to open it
            When a dependency is added
            Then the "<defails>" element will close




    Rule: Dependencies aren't connected to undo / redo
        This let's you experiment with dependecies separ

        Scenario: Upgrade version isn't undone
            Given I have made some changes to a widget
            When I remove a dependency
            And replace it with a newer version
            And press undo
            Then my most recent change to the widget is undone
            But my dependency is still the newer version