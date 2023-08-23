import { View } from "@webstd-ui/view"
import { PropertyDecoratorContext } from "../types"

/** @private */
export function getMetadataFromContext<T = unknown>(
    context: PropertyDecoratorContext,
    symbol: symbol
): T | undefined
export function getMetadataFromContext<T = unknown>(
    context: PropertyDecoratorContext,
    symbol: symbol,
    defaultValue: T
): T
export function getMetadataFromContext<T = unknown>(
    context: any,
    symbol: symbol,
    defaultValue?: T
): T | undefined {
    return (context.metadata[symbol] ??= defaultValue)
}

/** @private */
export function setMetadataOnContext<T = unknown>(
    context: PropertyDecoratorContext,
    symbol: symbol,
    value: T
): void
export function setMetadataOnContext<T = unknown>(context: any, symbol: symbol, value: T) {
    context.metadata[symbol] = value
}

/** @private */
export function getMetadataFromView<T = unknown>(view: View, symbol: symbol): T | undefined
export function getMetadataFromView<T = unknown>(view: View, symbol: symbol, defaultValue: T): T
export function getMetadataFromView<T = unknown>(
    view: View,
    symbol: symbol,
    defaultValue?: T
): T | undefined {
    return (Object.getPrototypeOf(view).constructor[(Symbol as any).metadata][symbol] ??=
        defaultValue)
}

/** @private */
export function setMetadataOnView<T = unknown>(view: View, symbol: symbol, value: T) {
    Object.getPrototypeOf(view).constructor[(Symbol as any).metadata][symbol] = value
}
