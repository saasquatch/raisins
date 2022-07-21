/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface MyCard {
        /**
          * Should show backwards?
         */
        "label": string;
    }
    interface MyComponent {
        /**
          * What to call people if we don't have their name
         */
        "anonymousLabel": string;
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
          * @default Your
         */
        "first": string;
        /**
          * The last name
          * @uiName Last Name
          * @default Friend
         */
        "last": string;
        /**
          * Truncates names longer than this
          * @uiName Max Length
          * @default 6
         */
        "maxLength": number;
        /**
          * The middle name
          * @uiName Middle Name
          * @default Best
         */
        "middle": string;
        /**
          * @demo Jeff - {"person": "Jeff"}
          * @demo Jess - {"person": "Jess"}
          * @demo No Name - {}
         */
        "myDemoProp": {
    person: string;
  };
        /**
          * Should show backwards?
         */
        "reverse": boolean;
    }
    interface MyShadowlessCard {
        /**
          * Should show backwards?
         */
        "label": string;
    }
    interface MySplit {
        /**
          * Should show backwards?
         */
        "reverse": boolean;
    }
    interface MyUiComponent {
        /**
          * The Age
          * @uiName Age
          * @default 10
          * @required
         */
        "age": string;
        /**
          * What to call people if we don't have their name
          * @uiName Anonymous Label
          * @uiEnum ["Friend", "Buddy", "Pal"]
          * @default Friend
         */
        "anonymousLabel": string;
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
          * @default Your
         */
        "first": string;
        /**
          * The last name
          * @uiName Last Name
          * @default Friend
         */
        "last": string;
        /**
          * Truncates names longer than this
          * @uiName Max Length
          * @default 6
         */
        "maxLength": number;
        /**
          * The middle name
          * @uiName Middle Name
          * @default Best
         */
        "middle": string;
        /**
          * @demo Jeff - {"person": "Jeff"}
          * @demo Jess - {"person": "Jess"}
          * @demo No Name - {}
         */
        "myDemoProp": {
    person: string;
  };
        /**
          * Date to display
          * @uiName Pick a Date
          * @uiWidget DatePicker
          * @uiWidgetOptions {"format":"milliseconds"}
         */
        "pickedDate": number;
        /**
          * Should show backwards?
         */
        "reverse": boolean;
        /**
          * @uiName Text Color
          * @uiEnum ["#F00", "#00F", "#0F0"]
          * @uiEnumNames ["Red", "Blue", "Green"]
          * @default #F00
         */
        "textColor": string;
        /**
          * A hidden field for internal use only
          * @undocumented
         */
        "undocumentedField": number;
    }
}
declare global {
    interface HTMLMyCardElement extends Components.MyCard, HTMLStencilElement {
    }
    var HTMLMyCardElement: {
        prototype: HTMLMyCardElement;
        new (): HTMLMyCardElement;
    };
    interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {
    }
    var HTMLMyComponentElement: {
        prototype: HTMLMyComponentElement;
        new (): HTMLMyComponentElement;
    };
    interface HTMLMyShadowlessCardElement extends Components.MyShadowlessCard, HTMLStencilElement {
    }
    var HTMLMyShadowlessCardElement: {
        prototype: HTMLMyShadowlessCardElement;
        new (): HTMLMyShadowlessCardElement;
    };
    interface HTMLMySplitElement extends Components.MySplit, HTMLStencilElement {
    }
    var HTMLMySplitElement: {
        prototype: HTMLMySplitElement;
        new (): HTMLMySplitElement;
    };
    interface HTMLMyUiComponentElement extends Components.MyUiComponent, HTMLStencilElement {
    }
    var HTMLMyUiComponentElement: {
        prototype: HTMLMyUiComponentElement;
        new (): HTMLMyUiComponentElement;
    };
    interface HTMLElementTagNameMap {
        "my-card": HTMLMyCardElement;
        "my-component": HTMLMyComponentElement;
        "my-shadowless-card": HTMLMyShadowlessCardElement;
        "my-split": HTMLMySplitElement;
        "my-ui-component": HTMLMyUiComponentElement;
    }
}
declare namespace LocalJSX {
    interface MyCard {
        /**
          * Should show backwards?
         */
        "label"?: string;
    }
    interface MyComponent {
        /**
          * What to call people if we don't have their name
         */
        "anonymousLabel"?: string;
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
          * @default Your
         */
        "first"?: string;
        /**
          * The last name
          * @uiName Last Name
          * @default Friend
         */
        "last"?: string;
        /**
          * Truncates names longer than this
          * @uiName Max Length
          * @default 6
         */
        "maxLength"?: number;
        /**
          * The middle name
          * @uiName Middle Name
          * @default Best
         */
        "middle"?: string;
        /**
          * @demo Jeff - {"person": "Jeff"}
          * @demo Jess - {"person": "Jess"}
          * @demo No Name - {}
         */
        "myDemoProp"?: {
    person: string;
  };
        /**
          * Should show backwards?
         */
        "reverse"?: boolean;
    }
    interface MyShadowlessCard {
        /**
          * Should show backwards?
         */
        "label"?: string;
    }
    interface MySplit {
        /**
          * Should show backwards?
         */
        "reverse"?: boolean;
    }
    interface MyUiComponent {
        /**
          * The Age
          * @uiName Age
          * @default 10
          * @required
         */
        "age"?: string;
        /**
          * What to call people if we don't have their name
          * @uiName Anonymous Label
          * @uiEnum ["Friend", "Buddy", "Pal"]
          * @default Friend
         */
        "anonymousLabel"?: string;
        /**
          * The first name of the user to display to their friends
          * @uiName First Name
          * @default Your
         */
        "first"?: string;
        /**
          * The last name
          * @uiName Last Name
          * @default Friend
         */
        "last"?: string;
        /**
          * Truncates names longer than this
          * @uiName Max Length
          * @default 6
         */
        "maxLength"?: number;
        /**
          * The middle name
          * @uiName Middle Name
          * @default Best
         */
        "middle"?: string;
        /**
          * @demo Jeff - {"person": "Jeff"}
          * @demo Jess - {"person": "Jess"}
          * @demo No Name - {}
         */
        "myDemoProp"?: {
    person: string;
  };
        /**
          * Date to display
          * @uiName Pick a Date
          * @uiWidget DatePicker
          * @uiWidgetOptions {"format":"milliseconds"}
         */
        "pickedDate"?: number;
        /**
          * Should show backwards?
         */
        "reverse"?: boolean;
        /**
          * @uiName Text Color
          * @uiEnum ["#F00", "#00F", "#0F0"]
          * @uiEnumNames ["Red", "Blue", "Green"]
          * @default #F00
         */
        "textColor"?: string;
        /**
          * A hidden field for internal use only
          * @undocumented
         */
        "undocumentedField"?: number;
    }
    interface IntrinsicElements {
        "my-card": MyCard;
        "my-component": MyComponent;
        "my-shadowless-card": MyShadowlessCard;
        "my-split": MySplit;
        "my-ui-component": MyUiComponent;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "my-card": LocalJSX.MyCard & JSXBase.HTMLAttributes<HTMLMyCardElement>;
            "my-component": LocalJSX.MyComponent & JSXBase.HTMLAttributes<HTMLMyComponentElement>;
            "my-shadowless-card": LocalJSX.MyShadowlessCard & JSXBase.HTMLAttributes<HTMLMyShadowlessCardElement>;
            "my-split": LocalJSX.MySplit & JSXBase.HTMLAttributes<HTMLMySplitElement>;
            "my-ui-component": LocalJSX.MyUiComponent & JSXBase.HTMLAttributes<HTMLMyUiComponentElement>;
        }
    }
}
