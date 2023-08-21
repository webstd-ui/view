export interface Constructor<T> {
    new (): T
}

export interface ToString {
    toString(): string
}

export interface Identifiable {
    id: ToString
}
