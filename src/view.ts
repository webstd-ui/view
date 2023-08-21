import { TemplateResult, render } from "lit-html"
import { withObservationTracking } from "@webstd-ui/observable"
import { initializeStatefulProperties } from "./state"
import { Constructor } from "./types"

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
}

/**
 * A decorator that creates a [custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
 * from a `View` class.
 *
 * @param tagName - the custom element tag name that this view will be registered as
 */
export function CustomElement<Target extends Constructor<View>>(tagName: string) {
    return (Ctor: Target, context: ClassDecoratorContext) => {
        const CustomElement = class extends HTMLElement {
            root: ShadowRoot
            view: View

            constructor() {
                super()
                this.root = this.attachShadow({ mode: "open" })
                this.view = new Ctor()
                initializeStatefulProperties(this.view)
            }

            static get observedAttributes() {
                return []
            }

            attributeChangedCallback(name: string, oldValue: any, newValue: any) {
                // const signal = this.attrs.get(name)
                // if (signal) {
                //     const [_, setAttr] = signal
                //     setAttr(newValue)
                // }
            }

            connectedCallback() {
                this.view.onAppear?.()

                if (typeof document !== undefined) {
                    // `task` only runs on the client
                    this.view.task?.()
                }

                withObservationTracking(() => {
                    render(this.view.body, this.root)
                })
            }

            disconnectedCallback() {
                this.view.onDisappear?.()
            }
        }

        context.addInitializer(() => customElements.define(tagName, CustomElement))
    }
}
