import { createScope, ScopeProvider } from 'jotai-molecules';
import React from 'react';

export const CanvasScope = createScope();

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  return (
    <ScopeProvider scope={CanvasScope} uniqueValue>
      {children}
    </ScopeProvider>
  );
}