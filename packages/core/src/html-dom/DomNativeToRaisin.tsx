import { RaisinNode } from "./RaisinNode";

export function domNativeToRaisin(node: NodeList): RaisinNode {
  const temp: RaisinNode = {
    type: "comment",
    data: ""
  };
  node;
  // TODO: add html dom conversion to raisinnode using browser parser
  return temp;
}
