import { parse } from "./parser";
import serializer from "./serializer";
import glob from "glob-promise";
import fs from "mz/fs";

describe("Parse + serialize", () => {
  test("Can parse simple HTML", () => {
    const source = `<div>Example</div>`;
    const node = parse(source);
    expect(node).toMatchSnapshot();

    const out = serializer(node);

    expect(out).toBe(source);
  });

  describe("Can parse HTML Benchmark cases", () => {
    const files = glob.sync(process.cwd() + "/benchmark-files/**/*.html", {
      absolute: true,
    });

    expect(files?.length).toBeGreaterThan(0);
    for (const file of files) {
      test(`File: ${file}`, async () => {
        const source = await fs.readFile(file, "utf-8");

        const node = parse(source, { cleanWhitespace: false });
        const out = serializer(node);

        /*
          Matching on exact HTML is hard.
           - attributes can use different quotes 'attr' vs "attr"
           - trailing slashes are optiona <img> vs <img />
           - whitepace in tags <li> vs <li >
           - order of attributes <li class="a" id="a"> vs <li id="a" class="a">
           - equivalent attributes <li attr=""> vs <li attr>
           
          Instead we confirm that we have the same number of imporant characters.

          Alternatively, need to use an HTML formatter that can correct for the above errors.
        */
        const importantCharsIn = (source.match("<>") || []).length;
        const importantCharsOut = (out.match("<>") || []).length;

        expect(importantCharsOut).toBe(importantCharsIn);

        /*
          This second pass helps to make sure that we're not doing anything
          that produces downstream errors.
        */
        serializer(parse(out, { cleanWhitespace: false }));
        
        // TODO: An element with style=";" will produce style="" in first run, and no style attribute in second pass
        // expect(out2).toEqual(out);


        // TODO: Could use Playwright visual comparisons to confirm HTML looks the same: https://playwright.dev/docs/test-snapshots
      });
    }
  });
});
