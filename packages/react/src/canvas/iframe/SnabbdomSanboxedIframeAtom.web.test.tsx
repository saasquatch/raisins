import { act, renderHook } from "@testing-library/react";
import { molecule, ScopeProvider, useMolecule } from "bunshi/react";
import { atom, createStore, Provider, useAtom } from "jotai";
import penpalUrl from "penpal/dist/penpal.min.js?url";
import React from "react";
import { h, type VNode } from "snabbdom";
import snabbdomUrl from "snabbdom?url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { NPMRegistry } from "../../util/NPMRegistry.ts";
import type {
  GeometryDetail,
  RawCanvasEvent,
} from "../api/_CanvasRPCContract.tsx";
import {
  SnabbdomIframeMolecule,
  SnabbdomIframeScope,
} from "./SnabbdomSanboxedIframeAtom.tsx";

// Serves the iframe's runtime from node_modules so tests never hit the CDN
const registryFor = (urls: Record<string, string>): NPMRegistry => ({
  getPackageJson: () => Promise.reject(new Error("Unused by the canvas")),
  resolvePath: (module) => new URL(urls[module.package]!, location.href).href,
});

const localRegistry = registryFor({ penpal: penpalUrl, snabbdom: snabbdomUrl });

const containers: HTMLElement[] = [];
afterEach(() => containers.splice(0).forEach((el) => el.remove()));

function mountCanvas({
  registry = localRegistry,
  eventTypes = [] as string[],
} = {}) {
  const store = createStore();
  const onEvent = vi.fn<(event: RawCanvasEvent) => void>();
  const onResize = vi.fn<(detail: GeometryDetail) => void>();
  const vnode = atom<VNode>(h("body"));
  const head = atom("");

  const Props = molecule(() => ({
    head,
    vnodeAtom: vnode,
    selector: atom("[raisin-events]"),
    registry: atom(registry),
    eventTypes: atom(new Set(eventTypes)),
    onEvent: atom(null, (_get, _set, event: RawCanvasEvent) => onEvent(event)),
    onResize: atom(null, (_get, _set, detail: GeometryDetail) =>
      onResize(detail),
    ),
  }));

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <Provider store={store}>
      <ScopeProvider scope={SnabbdomIframeScope} value={Props}>
        {children}
      </ScopeProvider>
    </Provider>
  );
  const { result } = renderHook(
    () => useAtom(useMolecule(SnabbdomIframeMolecule)),
    { wrapper },
  );

  const container = document.createElement("div");
  document.body.append(container);
  containers.push(container);

  const state = () => result.current[0];
  const setContainer = (el: HTMLElement | null) =>
    act(() => result.current[1](el));
  const iframe = () => container.querySelector("iframe");
  const frame = () => page.frameLocator(page.elementLocator(iframe()!));
  // The child patches document.body, so roots must be <body> like raisinToSnabbdom's
  const render = (...children: VNode[]) =>
    act(() => store.set(vnode, h("body", {}, children)));
  const setHead = (next: string) => act(() => store.set(head, next));

  return {
    state,
    setContainer,
    container,
    iframe,
    frame,
    render,
    setHead,
    onEvent,
    onResize,
  };
}

const loaded = async (canvas: ReturnType<typeof mountCanvas>) => {
  canvas.setContainer(canvas.container);
  await expect.poll(() => canvas.state().type).toBe("loaded");
};

describe("SnabbdomIframeMolecule", () => {
  it("throws without a SnabbdomIframeScope", () => {
    expect(() =>
      renderHook(() => useMolecule(SnabbdomIframeMolecule)),
    ).toThrowError(/Missing SnabbdomIframeScope/);
  });

  it("stays uninitialized until it has a container", () => {
    const canvas = mountCanvas();

    expect(canvas.state().type).toBe("uninitialized");
    expect(canvas.iframe()).toBeNull();
  });

  it("connects to a script-only sandboxed iframe", async () => {
    const canvas = mountCanvas();

    canvas.setContainer(canvas.container);
    expect(canvas.state().type).toBe("initializing");

    await expect.poll(() => canvas.state().type).toBe("loaded");
    expect(canvas.iframe()?.getAttribute("sandbox")).toBe("allow-scripts");
  });

  it("reports an error when the child runtime never connects", async () => {
    const canvas = mountCanvas({
      registry: registryFor({
        penpal: "/__missing__/penpal.js",
        snabbdom: snabbdomUrl,
      }),
    });

    canvas.setContainer(canvas.container);

    await expect
      .poll(() => canvas.state().type, { timeout: 8_000 })
      .toBe("error");
  }, 10_000);

  // expect.element can't see into the null-origin frame, so the child's geometry report is the oracle
  it("renders the vnode inside the iframe and reports its geometry", async () => {
    const canvas = mountCanvas();
    await loaded(canvas);

    canvas.render(
      h("p", { attrs: { "data-raisin": "hello" } }, "Hello canvas"),
    );

    await vi.waitFor(() =>
      expect(canvas.onResize).toHaveBeenCalledWith(
        expect.objectContaining({
          full: true,
          entries: expect.arrayContaining([
            expect.objectContaining({
              contentRect: expect.objectContaining({
                height: expect.toSatisfy((height: number) => height > 0),
              }),
              target: { attributes: { "data-raisin": "hello" } },
            }),
          ]),
        }),
      ),
    );
  });

  it("sizes the iframe to the child's content plus 5px", async () => {
    const canvas = mountCanvas();
    await loaded(canvas);

    canvas.render(h("div", { style: { height: "300px" } }));

    await expect.poll(() => canvas.iframe()?.height).toBe("305");
  });

  it("forwards subscribed events only from elements matching the selector", async () => {
    const canvas = mountCanvas({ eventTypes: ["click"] });
    await loaded(canvas);

    canvas.render(
      h("span", "Ignored"),
      h("button", { attrs: { "raisin-events": "", id: "target" } }, [
        h("b", "Nested"),
      ]),
    );

    await canvas.frame().getByText("Ignored").click();
    await canvas.frame().getByText("Nested").click();

    await vi.waitFor(() =>
      expect(canvas.onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          target: expect.objectContaining({
            attributes: { "raisin-events": "", id: "target" },
          }),
        }),
      ),
    );
    // RPC messages arrive in order, so a forwarded "Ignored" click would already be here
    expect(canvas.onEvent).toHaveBeenCalledTimes(1);
  });

  it("replaces the iframe when head changes and removes it without a container", async () => {
    const canvas = mountCanvas();
    await loaded(canvas);
    const first = canvas.iframe();

    canvas.setHead('<meta name="rebuild">');

    expect(canvas.container.querySelectorAll("iframe")).toHaveLength(1);
    expect(canvas.iframe()).not.toBe(first);
    await expect.poll(() => canvas.state().type).toBe("loaded");

    canvas.setContainer(null);

    expect(canvas.iframe()).toBeNull();
    expect(canvas.state().type).toBe("uninitialized");
  });
});
