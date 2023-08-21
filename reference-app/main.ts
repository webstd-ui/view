import { Observable, withObservationTracking } from "@webstd-ui/observable"
import {
    State,
    View,
    CustomElement,
    html,
    ForEach,
    Show,
    ViewModifier,
    modifier,
} from "@webstd-ui/view"

export class LinkViewModifier implements ViewModifier<HTMLAnchorElement> {
    #isAttached = false

    updateView({ content }: ViewModifier.Context<HTMLAnchorElement>) {
        if (!this.#isAttached) {
            content.addEventListener("click", event => {
                event.preventDefault()
                console.log(content.href)
            })
            this.#isAttached = true
        }
    }
}

const enhanceLink = modifier(LinkViewModifier)

@Observable
export class Library {
    books = [{ id: "foo" }, { id: "bar" }, { id: "baz" }]
}

@CustomElement("todo-app")
export class TodoApp implements View {
    @State count = 0

    library = new Library()

    @State character: any

    onAppear() {
        setInterval(() => (this.count += 1), 1000)
        setTimeout(() => this.library.books.push({ id: "New Book!" }), 2000)

        // withObservationTracking(() => {
        //     console.log("is even: ", this.count % 2 === 0)
        // })
    }

    async task() {
        this.character = await fetch(`https://swapi.dev/api/people/1/`).then(res => res.json())
    }

    get body() {
        return html`
            <style>
                :host {
                    font-family: sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
            </style>
            <div>Todo App</div>
            <code>
                ${Show(
                    { when: !!this.character },
                    () => html`${JSON.stringify(this.character, null, 4)}`
                )}
            </code>
            <a href="https://theverge.com" ${enhanceLink()}>Go to The Verge</a>
            <span><code>@State count</code>: ${this.count}</span>
            <span>${Show({ when: this.count % 2 === 0 }, () => html`Even Count!`)}</span>
            <ul>
                ${ForEach(this.library.books, book => html`<li>Book ${book.id}</li>`)}
            </ul>
        `
    }
}
