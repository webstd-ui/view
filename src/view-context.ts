import { View } from "@webstd-ui/view"
import { PropertyDecoratorContext } from "./types"
import { typedEventTarget } from "./generic-event-target"
import { getMetadataFromContext, getMetadataFromView } from "./utils"

const ViewContextSymbol = Symbol()

export function getViewContext(context: PropertyDecoratorContext | View): ViewContext {
    if ((context as View).body) {
        return getMetadataFromView(context as View, ViewContextSymbol, new ViewContext())
    }

    return getMetadataFromContext(
        context as PropertyDecoratorContext,
        ViewContextSymbol,
        new ViewContext()
    )
}

interface ViewContextEventMap {
    initialize: ViewInitializeEvent
    appear: ViewAppearEvent
    dissapear: ViewDissapearEvent
}

const ViewContextEventTarget = typedEventTarget<ViewContextEventMap>()

export class ViewContext extends ViewContextEventTarget {
    addInitializer(callback: (context: { view: View; element: HTMLElement }) => void) {
        this.addEventListener("initialize", callback)
    }

    onAppear(callback: (context: { view: View; element: HTMLElement }) => void) {
        this.addEventListener("appear", callback)
    }

    onDissapear(callback: (context: { view: View; element: HTMLElement }) => void) {
        this.addEventListener("dissapear", callback)
    }
}

export class ViewInitializeEvent extends Event {
    public constructor(public view: View, public element: HTMLElement) {
        super("initialize", { bubbles: true, composed: true })
    }
}

export class ViewAppearEvent extends Event {
    public constructor(public view: View, public element: HTMLElement) {
        super("appear", { bubbles: true, composed: true })
    }
}

export class ViewDissapearEvent extends Event {
    public constructor(public view: View, public element: HTMLElement) {
        super("dissapear", { bubbles: true, composed: true })
    }
}
