import { autoBindSteps, loadFeature, StepDefinitions } from "jest-cucumber";
import { RaisinNode } from "./RaisinNode";
import { removeWhitespace } from "./util";

const feature = loadFeature("./util.feature", { loadRelativePath: true });

export const removeWhitespaceSteps: StepDefinitions = ({
  given,
  when,
  then
}) => {
  let node: RaisinNode;
  let clean: RaisinNode;
  let expected: RaisinNode;

  given("a raisin node with html", () => {
    /*
		<div>
						<div>
						I am a div
					</div>		
			</div>
    */
    // node has the above html content:
    node = {
      type: "root",
      children: [
        {
          type: "text",
          data: "\n  \t"
        },
        {
          type: "tag",
          tagName: "div",
          children: [
            {
              type: "text",
              data: "\n\t\t\t\t\t"
            },
            {
              type: "tag",
              tagName: "div",
              children: [
                {
                  type: "text",
                  data: "\n\t\t\t\t\tI am a div\n\t\t\t\t"
                }
              ],
              attribs: {}
            },
            {
              type: "text",
              data: "\t\t\n\t\t"
            }
          ],
          attribs: {}
        },
        {
          type: "text",
          data: "\n  "
        }
      ]
    };
  });

  when("we run removeWhitespace on raisin node", () => {
    clean = removeWhitespace(node);
  });

  then('it should return html "<div><div>I am a div</div></div>"', () => {
    /*
		<div><div>I am a div</div></div>
  	*/
    // expected has the above html content:
    expected = {
      type: "root",
      children: [
        {
          type: "tag",
          tagName: "div",
          children: [
            {
              type: "tag",
              tagName: "div",
              children: [
                {
                  type: "text",
                  data: "I am a div"
                }
              ],
              attribs: {}
            }
          ],
          attribs: {}
        }
      ]
    };

    expect(clean).toStrictEqual(expected);
  });
};

autoBindSteps([feature], [removeWhitespaceSteps]);
