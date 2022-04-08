/// <reference types="cypress" />

import expect from "expect";
import isHtmlEquivalent from "./isHtmlEquivalent";
import parse from "./parser";
import serializer from "./serializer";

describe("Parse + serialize", () => {
  it("Can parse simple HTML", () => {
    const source = `<div>Example</div>`;
    const node = parse(source);
    const out = serializer(node);
    expect(out).toBe(source);
    cy.log("Pass");
  });

  it("Can parse Email Benchmark cases", () => {
    cy.task("getFiles", "benchmark-emails").each(file => {
      cy.readFile("./benchmark-emails/" + file).then(source => {
        const raisinNode = parse(source, {
          cleanWhitespace: false
        });
        const raisinString = serializer(raisinNode);
        expect(isHtmlEquivalent(source, raisinString)).toBe(true);
      });
    });
  });

  it("Can parse HTML Benchmark cases", () => {
    const badFileComments = [
      "15925c0d5cfc2d72411d63ba53616e60a4f80feddcae8b46ff2e03aafdbf50a8.html",
      "1bbc7f62e80e44afd533e896c0168c3b18f1e934530d05cb1f579ad3347d135c.html",
      "1de0efed4d661163ff8414e8ca69f45a49efd7edca19dc896ca0983a4bf41485.html",
      "1e62a223bca12adda6410b1789072a2ad755566bd4a6bc17d10dc95a51d74d65.html",
      "222dbaa4c9e280311e87e8793dd57e945cb019a7fae1a2b2fd4c6049ea148995.html",
      "257b3c0ed5dc1af7ebd88414785e86f12afd86a7fb1bf446fab2e7cedc9c6133.html",
      "4776d064a7bbefb99bc5c7b928359bcc66cd6c11d03785e43e03087c0f9e5fcc.html",
      "61adb9c208d9c67253b4413ef7ec2d010edae448b8c832bff2254125e4b51d5f.html",
      "6a59bd96489c98226c72f0245bac98a4b09aa0516ebfe4982233a6c33d129691.html",
      "72e78dee157bdf3e8a9a9f07e54a98a3714ea2998e2c2e2a94c46dbe92176feb.html",
      "749998378f1dcf37a9f24a5b3be83fee32f3bee78e165b33ad404138ee04df13.html",
      "7e91eb56692c91312a3dc3e7b769a2916029ef3d9e431d056d5f548c0f771d16.html",
      "81d304541f62a6aaf29494766718ab8e58e95a8e784613e75f106cdef17868d6.html",
      "a4dbbcc4b5ab24565e064f0a0f1059f3da69041ca39b19ece4757de691fd5b92.html",
      "a7ffddd80ae1b2cca0a77a25e288902b81d92bc24803df1f79cb19ed10d93d19.html",
      "a8e3b76061bee79be18b4fc5488d7bb65776ce3ab55fd21ed409f48415856c2f.html",
      "c076ffd4477b920e15df1c5efaa1b93badba9b270c0c1836ff02f2cf9c97367c.html",
      "cb3ce2786db729aa887ab6fd0b2f377549c235f3fc26e6e252efd6c92319b418.html",
      "ccada6580a0b1d05408db6d59cca18c2707530139807ebf112de8f6615d32b90.html",
      "cd65a11a9c7c6a3deac05443833a7097578ee6d5538479408dc0bbdbae438fcc.html",
      "e1e4dba652a78f4d1af52f5a7f4ac247c83070220a0e6fbad0bb26b6742dfcee.html",
      "fc5a55c65ef9b22d7309cdb4d9a6efe319baeda10190547b3e49dc9152e92f14.html",
      "fff65493446424d4b8d49bd1027a851bdd685a75bd11a324897ebe836b3ebb85.html"
    ];

    cy.task("getFiles", "benchmark-files").each(file => {
      cy.readFile("./benchmark-files/" + file).then(source => {
        const raisinNode = parse(source, { cleanWhitespace: false });
        const raisinString = serializer(raisinNode);

        let ignoreComments = false;
        /* Some files have comments that are parsed differently in browser, simply ignore them */
        if (badFileComments.includes(String(file))) ignoreComments = true;
        expect(
          isHtmlEquivalent(
            source,
            raisinString,
            { ignoreComments },
            { scriptingEnabled: false }
          )
        ).toBe(true);
      });
    });
  });
});
