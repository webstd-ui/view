import { View } from "@webstd-ui/view"

export interface Constructor<T> {
    new (): T
}

export type ViewConstructor = Constructor<View>

// export interface ViewConstructor {
//     new (element: HTMLElement): View
// }

export interface ToString {
    toString(): string
}

export interface Identifiable {
    id: ToString
}

export type PropertyDecoratorContext =
    | ClassAccessorDecoratorContext
    | ClassGetterDecoratorContext
    | ClassFieldDecoratorContext
