// @ts-nocheck
/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 *
 */
export function domready(targetDoc: HTMLDocument, fn: () => void) {
  let fns = [];
  let listener;
  let doc = targetDoc;
  // @ts-ignore
  let hack = doc.documentElement.doScroll;
  let domContentLoaded = 'DOMContentLoaded';
  let loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);

  if (!loaded)
    doc.addEventListener(
      domContentLoaded,
      (listener = () => {
        doc.removeEventListener(domContentLoaded, listener);
        loaded = true;
        while ((listener = fns.shift())) listener();
      }),
    );

  // @ts-ignore
  return loaded ? setTimeout(fn, 0) : fns.push(fn);
}
