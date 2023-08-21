import { repeat } from "lit-html/directives/repeat.js"
import { Identifiable } from "./types"
import { TemplateResult } from "lit-html"
import { when } from "lit-html/directives/when.js"

/**
 * A helper function that computes views on demand from an underlying collection of
 * identified data.
 *
 * Use `ForEach` to provide views based on an array of some data type. Either the
 * array's elements must conform to `Identifiable` or you need to provide an `id`
 * parameter to the `ForEach` initializer.
 *
 * @param data - The array of underlying identified data that SwiftUI uses to create views dynamically.
 * @param content - A function to create content on demand using the underlying data.
 * @returns A template of repeating data based on the `data` and `content` inputs.
 */
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
