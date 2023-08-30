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
    Property,
    EnvironmentKey,
    Environment,
    AppStorage,
    EmptyView,
} from "@webstd-ui/view"

export class LinkViewModifier implements ViewModifier<HTMLAnchorElement> {
    onAppear({ target }: ViewModifier.Context<HTMLAnchorElement>) {
        target.addEventListener("click", event => {
            event.preventDefault()
            console.log(target.href)
        })
    }
}

const enhanceLink = modifier(LinkViewModifier)

@Observable
export class Library {
    books = [{ id: "foo" }, { id: "bar" }, { id: "baz" }]

    get bookCount() {
        return this.books.length
    }
}

const LibraryKey = new EnvironmentKey({
    key: "library-env",
    defaultValue: new Library(),
})

@CustomElement("app-child")
export class Child implements View {
    @Environment(LibraryKey)
    library?: Library

    @Property({ attribute: "my-attr" })
    myAttr = "Hello, World"

    onAppear() {
        withObservationTracking(() => {
            // TODO: Override initial property value with initial attr value?
            // Currently this logs "Hello, World" once, then the externally set value
            console.log("app-child myAttr: ", this.myAttr)
        })
    }

    get body() {
        return html`Books Available: ${this.library?.bookCount}`
    }
}

@CustomElement("app-other")
export class Other implements View {
    @Environment(LibraryKey)
    library?: Library

    @Property() myProperty = "Hello, World"

    // FIXME: Ideally the environment objects would never be null or undefined
    onAppear() {
        withObservationTracking(() => {
            console.log("Book count: ", this.library?.bookCount ?? 0)
        })

        console.log("app-other myProperty: ", this.myProperty)
    }

    get body() {
        return html`
            <button @click="${() => this.library?.books.push({ id: Math.random().toString() })}">
                Add a Book!
            </button>
        `
    }
}

@CustomElement("todo-app")
export class TodoApp implements View {
    @AppStorage("app-counter")
    counter = 0

    @State count = 0
    @State character: any

    library = new Library()

    onAppear() {
        setInterval(() => (this.count += 1), 1000)
        setTimeout(() => this.library.books.push({ id: "New Book!" }), 2000)
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
            <button @click="${() => this.counter++}">Shared Counter: ${this.counter}</button>
            <library-env>
                <app-child my-attr="${"goodbye world"}"></app-child>
                <app-other .myProperty="${"goodbye world"}"></app-other>
            </library-env>
            <code>
                ${Show(
                    { when: !!this.character },
                    () => html`${JSON.stringify(this.character, null, 4)}`
                )}
            </code>
            <a href="https://theverge.com" ${enhanceLink()}>Go to The Verge</a>
            <span><code>@State count</code>: ${this.count}</span>
            <span>${this.count % 2 === 0 ? html`Even Count!` : EmptyView()}</span>
            <ul>
                ${ForEach(this.library.books, book => html`<li>Book ${book.id}</li>`)}
            </ul>
        `
    }
}

// @main
// class Benchmark extends App {
//     get head() {
//         return html`<link href="/css/currentStyle.css" rel="stylesheet" />`
//     }

//     get body() {
//         return html`<app-content></app-content>`
//     }
// }

// function random(max: number) {
//     return Math.round(Math.random() * 1000) % max
// }

// @Observable
// class Store {
//     data: { id: number; label: string }[] = []
//     selected?: number
//     id = 1

//     buildData(count = 1000) {
//         var adjectives = [
//             "pretty",
//             "large",
//             "big",
//             "small",
//             "tall",
//             "short",
//             "long",
//             "handsome",
//             "plain",
//             "quaint",
//             "clean",
//             "elegant",
//             "easy",
//             "angry",
//             "crazy",
//             "helpful",
//             "mushy",
//             "odd",
//             "unsightly",
//             "adorable",
//             "important",
//             "inexpensive",
//             "cheap",
//             "expensive",
//             "fancy",
//         ]
//         var colours = [
//             "red",
//             "yellow",
//             "blue",
//             "green",
//             "pink",
//             "brown",
//             "purple",
//             "brown",
//             "white",
//             "black",
//             "orange",
//         ]
//         var nouns = [
//             "table",
//             "chair",
//             "house",
//             "bbq",
//             "desk",
//             "car",
//             "pony",
//             "cookie",
//             "sandwich",
//             "burger",
//             "pizza",
//             "mouse",
//             "keyboard",
//         ]

//         var data = []

//         for (var i = 0; i < count; i++) {
//             data.push({
//                 id: this.id++,
//                 label:
//                     adjectives[random(adjectives.length)] +
//                     " " +
//                     colours[random(colours.length)] +
//                     " " +
//                     nouns[random(nouns.length)],
//             })
//         }

//         return data
//     }

//     updateData(mod: number = 10) {
//         var newData = [...this.data]

//         for (let i = 0; i < newData.length; i += 10) {
//             newData[i].label += " !!!"
//         }
//         this.data = newData
//     }

//     delete(id: number) {
//         const idx = this.data.findIndex(d => d.id == id)
//         this.data = this.data.slice(0, idx).concat(this.data.slice(idx + 1))
//     }

//     run() {
//         this.data = this.buildData()
//         this.selected = undefined
//     }

//     add() {
//         this.data = this.data.concat(this.buildData(1000))
//     }

//     update() {
//         this.updateData()
//     }

//     select(id: number) {
//         this.selected = id
//     }

//     runLots() {
//         this.data = this.buildData(10000)
//         this.selected = undefined
//     }

//     clear() {
//         this.data = []
//         this.selected = undefined
//     }

//     swapRows() {
//         if (this.data.length > 998) {
//             let d1 = this.data[1]
//             let d998 = this.data[998]

//             var newData = this.data.map((data, i) => {
//                 if (i === 1) {
//                     return d998
//                 } else if (i === 998) {
//                     return d1
//                 }
//                 return data
//             })

//             this.data = newData
//         }
//     }
// }

// @CustomElement("app-content")
// class Content implements View {
//     store = new Store()

//     get rows() {
//         return this.store.data
//     }

//     get selected() {
//         return this.store.selected
//     }

//     get body() {
//         return html`
//             <div class="container">
//                 <div class="jumbotron">
//                     <div class="row">
//                         <div class="col-md-6">
//                             <h1>Lit keyed</h1>
//                         </div>
//                         <div class="col-md-6">
//                             <div class="row">
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="run"
//                                         @click=${this.store.run}
//                                     >
//                                         Create 1,000 rows
//                                     </button>
//                                 </div>
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="runlots"
//                                         @click=${this.store.runLots}
//                                     >
//                                         Create 10,000 rows
//                                     </button>
//                                 </div>
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="add"
//                                         @click=${this.store.add}
//                                     >
//                                         Append 1,000 rows
//                                     </button>
//                                 </div>
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="update"
//                                         @click=${this.store.update}
//                                     >
//                                         Update every 10th row
//                                     </button>
//                                 </div>
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="clear"
//                                         @click=${this.store.clear}
//                                     >
//                                         Clear
//                                     </button>
//                                 </div>
//                                 <div class="col-sm-6 smallpad">
//                                     <button
//                                         type="button"
//                                         class="btn btn-primary btn-block"
//                                         id="swaprows"
//                                         @click=${this.store.swapRows}
//                                     >
//                                         Swap Rows
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <table class="table table-hover table-striped test-data" @click=${this.handleClick}>
//                     <tbody>
//                         ${ForEach(
//                             this.rows,
//                             item => html`
//                                 <tr id=${item.id} class=${item.id == this.selected ? "danger" : ""}>
//                                     <td class="col-md-1">${item.id}</td>
//                                     <td class="col-md-4">
//                                         <a data-action="select" data-id=${item.id}>${item.label}</a>
//                                     </td>
//                                     <td class="col-md-1">
//                                         <a>
//                                             <span
//                                                 class="glyphicon glyphicon-remove"
//                                                 aria-hidden="true"
//                                                 data-action="remove"
//                                                 data-id=${item.id}
//                                             ></span>
//                                         </a>
//                                     </td>
//                                     <td class="col-md-6"></td>
//                                 </tr>
//                             `
//                         )}
//                     </tbody>
//                 </table>
//                 <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
//             </div>
//         `
//     }

//     handleClick(event: any) {
//         const { action, id } = event.target.dataset
//         if (action && id) {
//             ;(this as any)[action](id)
//         }
//     }
// }
