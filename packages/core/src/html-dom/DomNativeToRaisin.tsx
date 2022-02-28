import { RaisinNode } from "./RaisinNode";

export function domNativeToRaisin(node: NodeList): RaisinNode {
  const temp: RaisinNode = {
    type: "comment",
    data: ""
  };

  console.log(node, temp);

  return temp;
}
