import { createScope, ScopeProvider } from 'bunshi/react';
import React from 'react';

export const CanvasScope = createScope<unknown>(undefined);
CanvasScope.displayName = 'CanvasScope';

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  return (
    <ScopeProvider scope={CanvasScope} uniqueValue>
      {children}
    </ScopeProvider>
  );
}
