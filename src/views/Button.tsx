import { h } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal';

export function Button(props: JSXBase.ButtonHTMLAttributes<HTMLButtonElement>, children: unknown) {
  return (
    <sl-button size="small" {...props}>
      {children}
    </sl-button>
  );
}
