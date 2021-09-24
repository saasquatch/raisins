import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CoreModel } from '../model/EditorModel';
import { ChildRPC, useSandboxedIframeRenderer } from './useSandboxedIframeRenderer';



export type Size = {
  name: string;
  width: string;
  height: number;
};
const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

function useInnerHtmlIframeRenderer(model: CoreModel) {
  const renderer = (iframe: HTMLIFrameElement, child: ChildRPC, Comp: React.FC): string => {
    if (!Comp) return ''; // no Component yet
    // if (!iframe.contentDocument) return;
    // const entryDiv = iframe.contentDocument!.querySelector("#root");
    // // iframe;
    // //    stencilView.view = <Comp />;
    // return ReactDOM.createPortal(<Comp />, entryDiv!);
    const htmlContent = ReactDOMServer.renderToStaticMarkup(<Comp />);

    child.render(htmlContent);

    return htmlContent!;
  };
  const onClick = (id: string) => model.setSelectedId(id);
  const props = useSandboxedIframeRenderer<React.FC>({
    renderer,
    initialComponent: () => <div />,
    onClick,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}


export default function useCanvas(props: CoreModel) {
  const frameProps = useInnerHtmlIframeRenderer(props);
  const [size, setSize] = useState<Size>(sizes[0]);

  return {
    sizes,
    size,
    setSize,
    ...frameProps,
  };
}
