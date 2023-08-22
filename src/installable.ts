import { View } from "@webstd-ui/view"
import { getMetadataFromContext } from "./utils"
import { PropertyDecoratorContext } from "./types"

/** @private */
export const InstallableSymbol = Symbol()

export type Installable = (view: View, element: HTMLElement) => void
export const getInstallablesFromContext = (context: PropertyDecoratorContext): Installable[] =>
    getMetadataFromContext(context, InstallableSymbol)
