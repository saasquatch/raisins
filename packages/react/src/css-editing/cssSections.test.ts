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
  const css =
    ':host { color: red; padding: 10px; } ::part(label) { color: blue; }';

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
      readSection(
        css,
        { type: 'element' },
        {
          exclude: excludedProperties.map(
            property => new RegExp(`^${property}$`)
          ),
        }
      )
    ).toBe(expected);
  });

  it('returns last matching rule', () => {
    const css = ':host { color: red; } :host { color: blue; }';
    expect(readSection(css, { type: 'element' }, { property: 'color' })).toBe(
      'blue'
    );
  });

  it('returns the last declaration if no !important is present', () => {
    const css = ':host { color: red; color: blue; }';
    expect(readSection(css, { type: 'element' }, { property: 'color' })).toBe(
      'blue'
    );
  });

  it('returns the last important declaration', () => {
    const css = ':host { color: red !important; color: blue !important; }';
    expect(readSection(css, { type: 'element' }, { property: 'color' })).toBe(
      'blue'
    );
  });

  it('returns important declarations even if there are non-important declarations after them', () => {
    const css = ':host { color: red !important; color: blue; }';
    expect(readSection(css, { type: 'element' }, { property: 'color' })).toBe(
      'red'
    );
  });
});

describe('readSectionShorthandDimension', () => {
  const section = { type: 'element' } as const;

  const dimensionsOf = (declarations: string, property = 'padding') =>
    Object.fromEntries(
      Object.entries(
        readSectionShorthandDimension(
          `:host { ${declarations}; }`,
          section,
          property
        )
      ).map(([side, value]) => [
        side,
        value ? `${value.value}${value.unit}` : null,
      ])
    );

  it.each([
    ['padding: 8px', { top: '8px', right: '8px', bottom: '8px', left: '8px' }],
    [
      'padding: 8px 12px',
      { top: '8px', right: '12px', bottom: '8px', left: '12px' },
    ],
    [
      'padding: 8px 12px 16px',
      { top: '8px', right: '12px', bottom: '16px', left: '12px' },
    ],
    [
      'padding: 8px 12px 16px 20%',
      { top: '8px', right: '12px', bottom: '16px', left: '20%' },
    ],
  ])('expands %s', (declarations, expected) => {
    expect(dimensionsOf(declarations)).toEqual(expected);
  });

  it('expands a hyphenated base property', () => {
    expect(
      dimensionsOf('border-width: 1px 2px 3px 4px', 'border-width')
    ).toEqual({
      top: '1px',
      right: '2px',
      bottom: '3px',
      left: '4px',
    });
  });

  it.each([
    ['padding: 0', { top: '0', right: '0', bottom: '0', left: '0' }],
    ['padding: 8px 0', { top: '8px', right: '0', bottom: '8px', left: '0' }],
    ['padding: 0 0 0 4px', { top: '0', right: '0', bottom: '0', left: '4px' }],
  ])('reads unitless zero in %s', (declarations, expected) => {
    expect(dimensionsOf(declarations)).toEqual(expected);
  });

  const noDimensions = { top: null, right: null, bottom: null, left: null };

  it.each([
    ['keyword values', 'padding: auto'],
    ['calc()', 'padding: calc(1px + 2px)'],
    ['var()', 'padding: var(--gap)'],
  ])('reports no dimensions for %s', (_label, declarations) => {
    expect(dimensionsOf(declarations)).toEqual(noDimensions);
  });

  it('reports no dimensions when the property is absent', () => {
    expect(dimensionsOf('color: red')).toEqual(noDimensions);
  });

  it('reports no dimensions when no rule matches the section', () => {
    expect(
      readSectionShorthandDimension(
        '::part(label) { padding: 8px; }',
        section,
        'padding'
      )
    ).toEqual(noDimensions);
  });

  it.each([
    ['padding: 8px; padding-left: 20px', 'left', '20px'],
    ['padding: 8px; padding-top: 10%', 'top', '10%'],
    ['padding: 8px; padding-top: 0', 'top', '0'],
  ])('lets longhand %s override shorthand', (declarations, side, expected) => {
    expect(dimensionsOf(declarations)[side]).toBe(expected);
  });

  it('reads a longhand with no shorthand present', () => {
    expect(dimensionsOf('padding-left: 4px')).toEqual({
      ...noDimensions,
      left: '4px',
    });
  });

  it('reads the first non-whitespace longhand value', () => {
    expect(dimensionsOf('padding-left:   4px')).toEqual({
      ...noDimensions,
      left: '4px',
    });
  });

  it('preserves shorthand when it is after longhand', () => {
    expect(dimensionsOf('padding-left: 4px; padding: 8px')).toEqual({
      top: '8px',
      right: '8px',
      bottom: '8px',
      left: '8px',
    });
  });

  it('preserves longhands when they are present after shorthand', () => {
    expect(dimensionsOf('padding: 8px; padding-left: 4px')).toEqual({
      top: '8px',
      right: '8px',
      bottom: '8px',
      left: '4px',
    });
  });

  it('preserves order with mixed shorthands and longhands', () => {
    expect(
      dimensionsOf('padding-left: 8px; padding: 4px; padding-right: 10px')
    ).toEqual({
      top: '4px',
      right: '10px',
      bottom: '4px',
      left: '4px',
    });
  });

  it('preserves !important property regardless of order', () => {
    expect(dimensionsOf('padding-left: 4px !important; padding: 8px')).toEqual({
      top: '8px',
      right: '8px',
      bottom: '8px',
      left: '4px',
    });
  });

  it('preserves order within important properties', () => {
    expect(
      dimensionsOf('padding-left: 4px !important; padding: 8px !important')
    ).toEqual({
      top: '8px',
      right: '8px',
      bottom: '8px',
      left: '8px',
    });
  });
});

describe('writeSection', () => {
  const section = { type: 'element' } as const;

  it.each([
    ['', 'color: red', 'red'],
    [
      ':host { color: blue; } ::part(label) { color: green; }',
      'color: red',
      'red',
    ],
  ])(
    'writes declarations into the selected section',
    (css, declarations, expected) => {
      const result = writeSection(css, section, declarations);

      expect(result.conflict).toBe(false);
      expect(readSection(result.css, section, { property: 'color' })).toBe(
        expected
      );
    }
  );

  it.each([
    [':host { color: red; }', '', [], 'color', '', false],
    [
      ':host { color: red; padding: 8px; }',
      '',
      [/^padding$/],
      'padding',
      '8px',
      false,
    ],
    [':host { color: red; }', 'color: blue', [/^color$/], 'color', 'red', true],
  ])(
    'removes or preserves declarations as requested',
    (css, declarations, preserve, property, expected, conflict) => {
      const result = writeSection(css, section, declarations, preserve);

      expect(result.conflict).toBe(conflict);
      expect(readSection(result.css, section, { property })).toBe(expected);
    }
  );

  it.each([
    [':host,.foo{color:red}', '.foo{color:red}:host{color:blue}'],
    ['.a,:host,.b{color:red}', '.a,.b{color:red}:host{color:blue}'],
  ])(
    'splits %s out of its grouped selector before writing',
    (css, expected) => {
      expect(writeSection(css, section, 'color: blue').css).toBe(expected);
    }
  );

  it('splits a grouped ::part selector before writing', () => {
    expect(
      writeSection(
        '::part(x),.foo{color:red}',
        { type: 'part', name: 'x' },
        'color: blue'
      ).css
    ).toBe('.foo{color:red}::part(x){color:blue}');
  });

  it('removes only its own selector when clearing a grouped rule', () => {
    expect(writeSection(':host,.foo{color:red}', section, '').css).toBe(
      '.foo{color:red}'
    );
  });

  it('is idempotent when splitting a grouped selector', () => {
    const once = writeSection(':host,.foo{color:red}', section, 'color:red')
      .css;
    expect(writeSection(once, section, 'color:red').css).toBe(once);
  });

  it('leaves rules inside at-rules untouched', () => {
    expect(
      writeSection(
        '@media (min-width:1px){:host{color:red}}',
        section,
        'color: blue'
      ).css
    ).toBe('@media (min-width:1px){:host{color:red}}:host{color:blue}');
  });

  it('appends a new rule for a section that has none', () => {
    expect(
      writeSection(
        ':host{color:red}',
        { type: 'part', name: 'hdr' },
        'color: blue'
      ).css
    ).toBe(':host{color:red}::part(hdr){color:blue}');
  });

  // Reading and writing both target the FIRST matching rule, while the cascade
  // applies the last. Pinned so a change here is a decision, not an accident.
  it('reads and writes the first of several matching rules', () => {
    const css = ':host{color:red}:host{color:blue}';
    expect(readSection(css, section, { property: 'color' })).toBe('blue');
    expect(writeSection(css, section, 'color: green').css).toBe(
      ':host{color:red}:host{color:green}'
    );
  });

  it('refuses to escape the section via a closing brace', () => {
    expect(
      writeSection(
        ':host{color:red}',
        section,
        'color:red} .other{display:none}'
      ).css
    ).toBe(':host{color:red}');
  });

  // Nested rules and at-rules survive into the block (that is how `&:hover`
  // works); they stay contained by the section's own selector.
  it.each([
    ['@import url(other.css)', ':host{@import url(other.css);}'],
    [':host{display:none}', ':host{:host{display:none}}'],
  ])('nests %s inside the section rule', (declarations, expected) => {
    expect(writeSection(':host{color:red}', section, declarations).css).toBe(
      expected
    );
  });

  it('round-trips a nested & rule without altering it', () => {
    const css = ':host{color:red;&:hover{color:blue}}';
    expect(writeSection(css, section, readSection(css, section)).css).toBe(css);
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
    expect(result.indexOf('margin:0')).toBeLessThan(
      result.indexOf('display:grid')
    );
  });

  it('splits a grouped selector before writing a property', () => {
    expect(
      writeSectionProperty(':host,.foo{color:red}', section, 'color', 'blue')
    ).toBe('.foo{color:red}:host{color:blue}');
  });

  it('reads and writes custom properties without accumulating whitespace', () => {
    let css = ':host{color:red}';
    css = writeSectionProperty(css, section, '--brand', 'blue');
    expect(readSection(css, section, { property: '--brand' })).toBe('blue');

    css = writeSectionProperty(css, section, '--brand', 'blue');
    expect(readSection(css, section, { property: '--brand' })).toBe('blue');
    expect(css).toBe(':host{color:red;--brand:blue}');
  });

  it('trims whitespace from a hand-authored custom property value', () => {
    expect(
      readSection(':host{--brand:   blue}', section, { property: '--brand' })
    ).toBe('blue');
  });

  it('refuses to escape the section via the value', () => {
    expect(
      writeSectionProperty(
        ':host{color:red}',
        section,
        'color',
        'red} :host{display:none'
      )
    ).toBe(':host{color:red}');
  });
});
