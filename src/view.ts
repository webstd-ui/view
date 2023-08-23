import { TemplateResult, render as diff } from "lit-html"
import { withObservationTracking } from "@webstd-ui/observable"
import { ViewConstructor } from "./types"
import {
    ViewAppearEvent,
    ViewContext,
    ViewDissapearEvent,
    ViewInitializeEvent,
    getViewContext,
} from "./internals/view-context"

/**
 * A type that represents part of your app's user interface and provides
 * modifiers that you use to configure views.
 *
 * @remarks
 * You create custom views by declaring types that conform to the `View`
 * interface. Implement the required `View.body` computed property to provide
 * the HTML content for your custom view.
 *
 * @example
 * ```ts
 * \@CustomElement("my-view")
 * class MyView implements View {
 *      get body() {
 *          return html`Hello, World!`
 *      }
 * }
 * ```
 *
 * Assemble the view's body by combining one or more built-in HTML elements,
 * like the text node in the example above, plus other custom elements that you register,
 * into a hierarchy of elements. For more information about creating custom elements, see
 * <doc:Declaring-a-Custom-View>.
 */
export interface View {
    readonly body: TemplateResult

    onAppear?: () => void
    onDisappear?: () => void
    task?: () => Promise<void>
    // observedTask?: () => Promise<void>
}

/**
 * A decorator that creates a [custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
 * from a `View` class.
 *
 * @param tagName - the custom element tag name that this view will be registered as
 */
export function CustomElement<ViewCtor extends ViewConstructor>(tagName: string) {
    return (View: ViewCtor, context: ClassDecoratorContext) => {
        const CustomElement = buildElementFromView(View)
        context.addInitializer(() => customElements.define(tagName, CustomElement))
    }
}

function buildElementFromView(View: ViewConstructor): CustomElementConstructor {
    return class extends HTMLElement {
        #root: ShadowRoot
        #view: View
        #context: ViewContext

        constructor() {
            super()

            this.#root = this.attachShadow({ mode: "open" })
            this.#view = new View()

            this.#context = getViewContext(this.#view)
            this.#context.dispatchEvent(new ViewInitializeEvent(this.#view, this))
        }

        #initializeRendering() {
            withObservationTracking(() => {
                // Diff `view.body` with the shadow root and apply changes every
                // time data that `view.body` depends on changes.
                diff(this.#view.body, this.#root)
            })
        }

        connectedCallback() {
            this.#view.onAppear?.()

            // `task` only runs on the client
            if (typeof document !== undefined) {
                this.#view.task?.()
            }

            this.#context.dispatchEvent(new ViewAppearEvent(this.#view, this))
            this.#initializeRendering()
        }

        disconnectedCallback() {
            this.#view.onDisappear?.()
            this.#context.dispatchEvent(new ViewDissapearEvent(this.#view, this))
        }
    }
}
