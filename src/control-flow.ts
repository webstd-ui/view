import { repeat } from "lit-html/directives/repeat.js"
import { Identifiable } from "./types"
import { TemplateResult } from "lit-html"
import { when } from "lit-html/directives/when.js"

export function ForEach<Data extends Identifiable[]>(
    data: Data,
    content: (datum: Data[number], index: number) => TemplateResult
) {
    return repeat(data, datum => datum.id.toString(), content)
}

export function Show(
    { when: condition, fallback }: { when: boolean; fallback?: () => TemplateResult },
    content: () => TemplateResult
) {
    return when(condition, content, fallback)
}

export { ifDefined } from "lit-html/directives/if-defined.js"
export { classMap } from "lit-html/directives/class-map.js"
export { styleMap } from "lit-html/directives/style-map.js"
