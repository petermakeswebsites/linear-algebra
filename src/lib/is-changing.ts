import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";

export function isChanging(store : Readable<any>, timeout = 100) : Readable<Boolean> {
    const {subscribe, set} = writable(false)
    let id : ReturnType<typeof setTimeout> = -1
    store.subscribe(() => {
        set(true)
        clearTimeout(id)
        id = setTimeout(() => {
            set(false)
        }, timeout)
    })

    return {subscribe}
}