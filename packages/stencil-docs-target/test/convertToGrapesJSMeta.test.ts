import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { JsonDocs } from "@stencil/core/internal";
import { convertToGrapesJSMeta } from "../src/convertToRaisins.ts";

function tagFor(
  docsTags: Array<{ name: string; text: string }>,
  props: unknown[] = [],
) {
  // oxlint-disable no-unsafe-type-assertion
  const module = convertToGrapesJSMeta({
    components: [
      {
        tag: "my-component",
        docsTags,
        props,
        dependencies: [],
      },
    ],
  } as unknown as JsonDocs);
  const tag = module.tags?.[0];
  assert.ok(tag);
  return tag;
}

function defaultFor(prop: {
  default?: string;
  docsTags: Array<{ name: string; text: string }>;
}) {
  const attribute = tagFor([], [{ name: "label", attr: "label", ...prop }])
    .attributes?.[0];
  assert.ok(attribute);
  return attribute.default;
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

  void describe("attribute defaults", () => {
    void it("unquotes a string initializer that Stencil 4 copied into @default", () => {
      assert.equal(
        defaultFor({
          default: '"Friend"',
          docsTags: [{ name: "default", text: '"Friend"' }],
        }),
        "Friend",
      );
    });

    void it("keeps a non-string @default as attribute text", () => {
      const injected = (literal: string) =>
        defaultFor({
          default: literal,
          docsTags: [{ name: "default", text: literal }],
        });
      assert.equal(injected("false"), "false");
      assert.equal(injected("6"), "6");
    });

    void it("parses the initializer when there is no @default tag (Stencil 2)", () => {
      assert.equal(defaultFor({ default: '"Friend"', docsTags: [] }), "Friend");
    });

    void it("keeps an authored @default verbatim", () => {
      assert.equal(
        defaultFor({
          default: '"Friend"',
          docsTags: [{ name: "default", text: "Pal" }],
        }),
        "Pal",
      );
      assert.equal(
        defaultFor({ docsTags: [{ name: "default", text: "Friend" }] }),
        "Friend",
      );
    });
  });
});
