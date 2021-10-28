import { htmlParser as parse, RaisinElementNode } from '@raisins/core';
import * as schema from '@raisins/schema/schema';
import { Block } from '../ComponentModel';
import { ModuleDetails } from '../ModuleManagement';

/**
 * Converts module details into a set of `Block`
 *
 * Blocks are used for inserting example content into Raisin
 *
 * @param moduleDetails
 * @returns
 */
export function moduleDetailsToBlocks(moduleDetails: ModuleDetails[]): Block[] {
  return moduleDetails.reduce((agg, npmMod) => {
    // Adds each NPM modules list of `raisin` contents`
    return (
      npmMod.raisins?.modules?.reduce((modBlocks, mod) => {
        // Adds examples from the top "module" level of the raisins schema
        const moduleLevelExamples =
          mod.examples?.reduce(reduceExamples, modBlocks) ?? modBlocks;

        // Adds examples from the tag level
        return (
          mod.tags?.reduce((tagBlocks, tag) => {
            return tag.examples?.reduce(reduceExamples, tagBlocks) ?? tagBlocks;
          }, moduleLevelExamples) ?? moduleLevelExamples
        );
      }, agg) ?? agg
    );
  }, [] as Block[]);
}

function reduceExamples(
  previousValue: Block[],
  currentValue: schema.Example
): Block[] {
  const elm = blockFromHtml(currentValue.content);
  if (!elm) return previousValue;
  const blockExample = {
    title: currentValue.title,
    content: elm,
  };
  return [...previousValue, blockExample];
}

function blockFromHtml(html: string): RaisinElementNode | undefined {
  try {
    return parse(html).children[0] as RaisinElementNode;
  } catch (e) {
    return undefined;
  }
}
