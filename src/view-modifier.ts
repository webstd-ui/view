import {
    Directive,
    DirectiveResult,
    ElementPart,
    PartInfo,
    PartType,
    directive,
} from "lit-html/directive.js"
import { Constructor } from "./types"
import { TemplateResult } from "."

export namespace ViewModifier {
    export interface Context<Target extends Element, Params extends Array<any> = Array<never>> {
        target: Target
        parameters: Params
    }
}

/**
 * A modifier that you apply to an element, modifying the behavior of the
 * original element.
 *
 * Adopt the `ViewModifier` interface when you want to create a reusable
 * modifier that you can apply to any element.
 */
export interface ViewModifier<Content extends Element, Params extends Array<any> = Array<never>> {
    body?: (context: ViewModifier.Context<Content, Params>) => TemplateResult

    onAppear?: (context: ViewModifier.Context<Content, Params>) => void
    onUpdate?: (
        context: ViewModifier.Context<Content, Params>
    ) => TemplateResult | undefined | symbol | void
}

export type Modifier<Params extends Array<any>> = (...args: Params) => DirectiveResult

/**
 * Creates a modifier function from a `ViewModifier`-conforming class constructor
 */
export function modifier<Content extends Element, Params extends Array<any> = Array<never>>(
    Modifier: Constructor<ViewModifier<Content, Params>>
): Modifier<Params> {
    return directive(
        class extends Directive {
            #hasAppeared = false
            mod = new Modifier()

            constructor(partInfo: PartInfo) {
                super(partInfo)
                if (partInfo.type !== PartType.ELEMENT) {
                    throw new Error("ViewModifiers must be applied to an element directly.")
                }
            }

            update(_part: ElementPart, props: Params) {
                if (!this.#hasAppeared) {
                    this.mod.onAppear?.({
                        target: _part.element as Content,
                        parameters: props,
                    })
                    this.#hasAppeared = true
                }

                let result =
                    this.mod.body?.({
                        target: _part.element as Content,
                        parameters: props,
                    }) ||
                    this.mod.onUpdate?.({
                        target: _part.element as Content,
                        parameters: props,
                    })

                return result
            }

            render() {}
        }
    )
}

// TODO: Bindable ViewModifier
// <input ${bindTo(this.user.$name)}>
// https://github.com/vuejs/core/blob/bd08f057fc568f15ca19bfae1a4e506f2bc48ca8/packages/runtime-dom/src/directives/vModel.ts
