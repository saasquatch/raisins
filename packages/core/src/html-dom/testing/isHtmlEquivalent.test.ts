import { isHtmlEquivalent } from "./isHtmlEquivalent";

describe("Parse comparison functions", () => {
  test("Different attributes", () => {
    const node_a = `<div left center right>I am a div</div>`;
    const node_b = `<div center right lefty >I am a div</div>`;

    expect(() => {
      isHtmlEquivalent(node_a, node_b);
    }).toThrowError();
  });

  test("Different node names", () => {
    const node_a = `<span></span>`;
    const node_b = `<div></div>`;

    expect(() => {
      isHtmlEquivalent(node_a, node_b);
    }).toThrowError();
  });

  test("Extra text", () => {
    const node_a = `<div></div>`;
    const node_b = `<div>Has text</div>`;

    expect(() => {
      isHtmlEquivalent(node_a, node_b);
    }).toThrowError();
  });

  test("Extra child", () => {
    const node_a = `<div></div>`;
    const node_b = `<div><span></span></div>`;

    expect(() => {
      isHtmlEquivalent(node_a, node_b);
    }).toThrowError();
  });

  test("Inline styles with different content are differnet", () => {
    var style_a = `<div style="display: none;">I am a div</div>`;
    var style_b = `<div style=''>I am a div</div>`;
    expect(() => {
      isHtmlEquivalent(style_a, style_b);
    }).toThrowError();
  });

  test("Inline styles with different syntax", () => {
    var style_a = `<div style="display: none;">I am a div</div>`;
    var style_b = `<div style='display:none'>I am a div</div>`;
    expect(isHtmlEquivalent(style_a, style_b)).toBeTruthy();
  });

  test("Styles tags <style> with different syntax", () => {
    var style_a = `<style>display: none;</style>`;
    var style_b = `<style>  display: none</style>`;
    expect(isHtmlEquivalent(style_a, style_b)).toBeTruthy();
  });

  test("Different whitespaces between HTML elements", () => {
    const html_a = `
      <!DOCTYPE html>
      <html>
  
      <body>
          <h1>My First Heading</h1>
          <p>My first paragraph.</p>
      </body>
  
      </html>
     `;
    const html_b = `   
     <!DOCTYPE html>
          <html>
                <body>
                    <h1>My First Heading</h1>
                    <p>My first paragraph.</p>
                </body>          </html>
    `;

    expect(isHtmlEquivalent(html_a, html_b)).toBeTruthy();
  });
});
