import { View } from "@webstd-ui/view"

/** @private */
export function getMetadataFromContext(context: any, symbol: symbol) {
    return (context.metadata[symbol] ??= [])
}

/** @private */
export function getMetadataFromView(view: View, symbol: symbol) {
    const metadataSymbol = (Symbol as any).metadata
    const prototype = Object.getPrototypeOf(view)
    return (prototype.constructor[metadataSymbol][symbol] ??= [])
}
