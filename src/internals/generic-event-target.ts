export interface GenericEventTarget<EventMap extends object> extends EventTarget {
    addEventListener<K extends keyof EventMap>(
        type: K,
        listener: (event: EventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void

    dispatchEvent(event: Event): boolean
    dispatchEvent(event: Event): boolean
}

export type GenericEventTargetConstructor<EventMap extends object> = {
    new (): GenericEventTarget<EventMap>
    prototype: GenericEventTarget<EventMap>
}

export function typedEventTarget<
    EventMap extends object
>(): GenericEventTargetConstructor<EventMap> {
    return EventTarget as GenericEventTargetConstructor<EventMap>
}
