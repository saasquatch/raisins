import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { JsonDocs } from "@stencil/core/internal";
import { convertToGrapesJSMeta } from "../src/convertToRaisins.ts";

function tagFor(docsTags: Array<{ name: string; text: string }>) {
  // oxlint-disable no-unsafe-type-assertion
  const module = convertToGrapesJSMeta({
    components: [
      {
        tag: "my-component",
        docsTags,
        props: [],
        dependencies: [],
      },
    ],
  } as unknown as JsonDocs);
  const tag = module.tags?.[0];
  assert.ok(tag);
  return tag;
}

function assertThrowsIncluding(fn: () => unknown, message: string) {
  assert.throws(
    fn,
    (e: unknown) => e instanceof Error && e.message.includes(message),
  );
}

void describe("convertToGrapesJSMeta", () => {
  for (const tagName of ["csspart", "cssprop"]) {
    void it(`rejects an empty @${tagName} name`, () => {
      assertThrowsIncluding(
        () => tagFor([{ name: tagName, text: "" }]),
        `Invalid @${tagName} tag on component "my-component" is missing a name.`,
      );
    });
  }

  void describe("@csspart", () => {
    void it("reads a name and description", () => {
      assert.deepEqual(
        tagFor([{ name: "csspart", text: "header - The card header" }])
          .cssParts,
        [{ name: "header", description: "The card header" }],
      );
    });

    void it("reads a name with no description", () => {
      assert.deepEqual(tagFor([{ name: "csspart", text: "header" }]).cssParts, [
        { name: "header", description: undefined },
      ]);
    });

    void it("trims surrounding whitespace", () => {
      assert.deepEqual(
        tagFor([{ name: "csspart", text: "  header  -  The card header  " }])
          .cssParts,
        [{ name: "header", description: "The card header" }],
      );
    });

    void it("keeps later separators in the description", () => {
      assert.deepEqual(
        tagFor([{ name: "csspart", text: "header - a - b" }]).cssParts,
        [{ name: "header", description: "a - b" }],
      );
    });

    void it("reads every part, in order", () => {
      assert.deepEqual(
        tagFor([
          { name: "csspart", text: "header" },
          { name: "csspart", text: "body" },
        ]).cssParts,
        [
          { name: "header", description: undefined },
          { name: "body", description: undefined },
        ],
      );
    });

    void it("is undefined when the component declares none", () => {
      assert.equal(tagFor([]).cssParts, undefined);
    });
  });

  void describe("@cssprop", () => {
    void it("reads a name and description", () => {
      assert.deepEqual(
        tagFor([{ name: "cssprop", text: "--brand - The brand color" }])
          .cssProperties,
        [{ name: "--brand", description: "The brand color" }],
      );
    });

    void it("reads a name with no description", () => {
      assert.deepEqual(
        tagFor([{ name: "cssprop", text: "--brand" }]).cssProperties,
        [{ name: "--brand", description: undefined }],
      );
    });

    void it("is undefined when the component declares none", () => {
      assert.equal(tagFor([]).cssProperties, undefined);
    });

    void it('checks that props is valid and starts with "--"', () => {
      assertThrowsIncluding(
        () => tagFor([{ name: "cssprop", text: "brand - The brand color" }]),
        `Invalid @cssprop tag on component "my-component" must start with "--".`,
      );
    });
  });
});
