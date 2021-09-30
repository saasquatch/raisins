/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface MyComponent {
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
         */
        "first": string;
        /**
          * The last name
          * @uiName Last Name
         */
        "last": string;
        /**
          * The middle name
          * @uiName Middle Name
         */
        "middle": string;
        /**
          * Should show backwards?
         */
        "reverse": boolean;
    }
}
declare global {
    interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {
    }
    var HTMLMyComponentElement: {
        prototype: HTMLMyComponentElement;
        new (): HTMLMyComponentElement;
    };
    interface HTMLElementTagNameMap {
        "my-component": HTMLMyComponentElement;
    }
}
declare namespace LocalJSX {
    interface MyComponent {
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
         */
        "first"?: string;
        /**
          * The last name
          * @uiName Last Name
         */
        "last"?: string;
        /**
          * The middle name
          * @uiName Middle Name
         */
        "middle"?: string;
        /**
          * Should show backwards?
         */
        "reverse"?: boolean;
    }
    interface IntrinsicElements {
        "my-component": MyComponent;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "my-component": LocalJSX.MyComponent & JSXBase.HTMLAttributes<HTMLMyComponentElement>;
        }
    }
}
