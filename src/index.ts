import "./internals/symbol-metadata"

export { html } from "lit-html"
export type { HTMLTemplateResult as TemplateResult } from "lit-html"
import { nothing } from "lit-html"
export const EmptyView = () => nothing

export type { View } from "./view"
export { CustomElement } from "./view"
export { ForEach, Show, ifDefined, classMap, styleMap } from "./control-flow"
export { State } from "./state"
export { Property } from "./property"
export { AppStorage, SessionStorage } from "./storage"
export type { ViewModifier, Modifier } from "./view-modifier"
export { modifier } from "./view-modifier"
export { EnvironmentKey, Environment } from "./environment"
