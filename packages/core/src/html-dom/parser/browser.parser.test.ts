import {parse} from "./browser.parser";

test("Parse nodes", () => {
    const el = parse("<div>Hello world</div>")    
    expect(el).not.toBeUndefined();
    expect((el.querySelector("body")?.firstChild as HTMLElement).nodeName).toBe("DIV");
});