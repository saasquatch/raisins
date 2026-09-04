import {
  readSection,
  readSectionShorthandDimension,
  selectorOf,
  writeSection,
  writeSectionProperty,
} from './cssSections';

describe('selectorOf', () => {
  it.each([
    [{ type: 'element' } as const, ':host'],
    [{ type: 'part', name: 'label' } as const, '::part(label)'],
  ])('serializes %o as %s', (section, expected) => {
    expect(selectorOf(section)).toBe(expected);
  });
});

describe('readSection', () => {
  const css = ':host { color: red; padding: 10px; } ::part(label) { color: blue; }';

  it.each([
    [{ type: 'element' } as const, 'color', 'red'],
    [{ type: 'part', name: 'label' } as const, 'color', 'blue'],
    [{ type: 'part', name: 'missing' } as const, 'color', ''],
  ])('reads %s from %o', (section, property, expected) => {
    expect(readSection(css, section, { property })).toBe(expected);
  });

  it.each([
    ['color:red', ['padding']],
    ['color:red', ['padding', 'margin']],
  ])('excludes managed declarations', (expected, excludedProperties) => {
    expect(
      readSection(css, { type: 'element' }, {
        exclude: excludedProperties.map(property => new RegExp(`^${property}$`)),
      })
    ).toBe(expected);
  });
});

describe('readSectionShorthandDimension', () => {
  const section = { type: 'element' } as const;

  it.each([
    ['padding: 8px', { top: '8px', right: '8px', bottom: '8px', left: '8px' }],
    ['padding: 8px 12px', { top: '8px', right: '12px', bottom: '8px', left: '12px' }],
    ['padding: 8px 12px 16px', { top: '8px', right: '12px', bottom: '16px', left: '12px' }],
    ['padding: 8px 12px 16px 20%', { top: '8px', right: '12px', bottom: '16px', left: '20%' }],
  ])('expands %s', (declarations, expected) => {
    const dimensions = readSectionShorthandDimension(
      `:host { ${declarations}; }`,
      section,
      'padding'
    );

    expect(
      Object.fromEntries(
        Object.entries(dimensions).map(([side, value]) => [
          side,
          value ? `${value.value}${value.unit}` : null,
        ])
      )
    ).toEqual(expected);
  });

  it.each([
    ['padding: 8px; padding-left: 20px', 'left', '20px'],
    ['padding: 8px; padding-top: 10%', 'top', '10%'],
  ])('lets longhand %s override shorthand', (declarations, side, expected) => {
    const value = readSectionShorthandDimension(
      `:host { ${declarations}; }`,
      section,
      'padding'
    )[side as 'top' | 'right' | 'bottom' | 'left'];

    expect(value && `${value.value}${value.unit}`).toBe(expected);
  });
});

describe('writeSection', () => {
  const section = { type: 'element' } as const;

  it.each([
    ['', 'color: red', 'red'],
    [':host { color: blue; } ::part(label) { color: green; }', 'color: red', 'red'],
  ])('writes declarations into the selected section', (css, declarations, expected) => {
    const result = writeSection(css, section, declarations);

    expect(result.conflict).toBe(false);
    expect(readSection(result.css, section, { property: 'color' })).toBe(expected);
  });

  it.each([
    [':host { color: red; }', '', [], 'color', '', false],
    [':host { color: red; padding: 8px; }', '', [/^padding$/], 'padding', '8px', false],
    [':host { color: red; }', 'color: blue', [/^color$/], 'color', 'red', true],
  ])('removes or preserves declarations as requested', (css, declarations, preserve, property, expected, conflict) => {
    const result = writeSection(css, section, declarations, preserve);

    expect(result.conflict).toBe(conflict);
    expect(readSection(result.css, section, { property })).toBe(expected);
  });
});

describe('writeSectionProperty', () => {
  const section = { type: 'element' } as const;

  it.each([
    [':host { color: red; }', 'color', 'blue', 'blue'],
    [':host { color: red; }', 'display', 'grid', 'grid'],
    [':host { color: red; }', 'color', '', ''],
  ])('updates, adds, or removes %s', (css, property, value, expected) => {
    const result = writeSectionProperty(css, section, property, value);

    expect(readSection(result, section, { property })).toBe(expected);
  });

  it('replaces all duplicate declarations at the last declaration position', () => {
    const result = writeSectionProperty(
      ':host { color: red; display: -webkit-box; margin: 0; display: flex; }',
      section,
      'display',
      'grid'
    );

    expect(result).toContain('display:grid');
    expect(result).not.toContain('-webkit-box');
    expect(result).not.toContain('display:flex');
    expect(result.indexOf('margin:0')).toBeLessThan(result.indexOf('display:grid'));
  });
});