import expect from "expect";
import parse from "./parser";
import serializer from "./serializer";

describe("Parse + serialize", () => {
  test("Can parse simple HTML", () => {
    const source = `<div>Example</div>`;
    const node = parse(source);
    expect(node).toMatchSnapshot();

    const out = serializer(node);

    expect(out).toBe(source);
  });

//   describe("Can parse Email Benchmark cases", () => {
//     const files = glob.sync(process.cwd() + "/benchmark-emails/**/*.html", {
//       absolute: true
//     });
//     expect(files?.length).toBeGreaterThan(0);
//     for (const file of files) {
//       test(`File ${files.indexOf(file)}: ${file}`, async () => {
//         var source = await fs.readFile(file, "utf-8");
//         const raisinNode = parse(source, {
//           cleanWhitespace: false
//         });
//         const raisinString = serializer(raisinNode);
//         isHtmlEquivalent(source, raisinString);
//       });
//     }
//   });

//   describe("Can parse HTML Benchmark cases", () => {
//     const files = glob.sync(process.cwd() + "/benchmark-files/**/*.html", {
//       absolute: true
//     });
//     expect(files?.length).toBeGreaterThan(0);
//     for (const file of files) {
//       test(`File ${files.indexOf(file)}: ${file}`, async () => {
//         var source = await fs.readFile(file, "utf-8");
//         const raisinNode = parse(source, {
//           cleanWhitespace: false
//         });
//         const raisinString = serializer(raisinNode);
//         isHtmlEquivalent(source, raisinString);
//       });
//     }
//   });
});
