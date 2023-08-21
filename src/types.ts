import { View } from "."

export interface Constructor<T> {
    new (): T
}

export interface ViewConstructor {
    new (element: HTMLElement): View
}

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
