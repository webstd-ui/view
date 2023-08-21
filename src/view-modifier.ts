import { TemplateResult } from "lit-html"
import {
    Directive,
    DirectiveResult,
    ElementPart,
    PartInfo,
    PartType,
    directive,
} from "lit-html/directive.js"
import { Constructor } from "./types"

export namespace ViewModifier {
    export interface Context<Content extends Element, Params extends Array<any> = Array<never>> {
        content: Content
        parameters: Params
    }
}

export interface ViewModifier<Content extends Element, Params extends Array<any> = Array<never>> {
    body?: (context: ViewModifier.Context<Content, Params>) => TemplateResult
    updateView?: (
        context: ViewModifier.Context<Content, Params>
    ) => TemplateResult | undefined | void
}

type Modifier<Params extends Array<any>> = (...args: Params) => DirectiveResult

export function modifier<Content extends Element, Params extends Array<any> = Array<never>>(
    Modifier: Constructor<ViewModifier<Content, Params>>
): Modifier<Params> {
    return directive(
        class extends Directive {
            mod = new Modifier()

            constructor(partInfo: PartInfo) {
                super(partInfo)
                if (partInfo.type !== PartType.ELEMENT) {
                    throw new Error("ViewModifiers must be applied to an element directly.")
                }
            }

            update(_part: ElementPart, props: Params): void | TemplateResult | undefined {
                let result = this.mod.updateView?.({
                    content: _part.element as Content,
                    parameters: props,
                })
                if (!result)
                    result = this.mod.body?.({
                        content: _part.element as Content,
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
