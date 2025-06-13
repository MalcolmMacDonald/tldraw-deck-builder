import {Editor, Tldraw, TLStoreSnapshot,} from 'tldraw'
import {CustomMainMenu} from '@/CustomMainMenu'
import {
    ChangePropagator,
    ClickPropagator,
    registerPropagators,
    SpatialPropagator,
    TickPropagator
} from '@/propagators/ScopedPropagators'
import React from "react";
import loadValTownState from "@/ValTown-State.ts";

export default function YjsExample() {
    //fetch  the initial snapshot from the JSON file
    const [initialSnapshot, setInitialSnapshot] = React.useState<TLStoreSnapshot | null>(null);
    React.useEffect(() => {
        loadValTownState()
            .then(snapshot => {
                setInitialSnapshot(snapshot);
            })
            .catch(error => console.error('Error fetching initial snapshot:', error));
    }, []);
    return (
        <div className="tldraw__editor">
            <Tldraw
                components={{
                    MainMenu: CustomMainMenu,
                }}
                onMount={onMount}
                snapshot={initialSnapshot}
            />
        </div>
    )
}

function onMount(editor: Editor) {
    
    //@ts-expect-error
    window.editor = editor
    // stop double click text creation
    // @ts-expect-error
    editor.getStateDescendant('select.idle').handleDoubleClickOnCanvas = () => void null;
    registerPropagators(editor, [
        ChangePropagator,
        ClickPropagator,
        TickPropagator,
        SpatialPropagator,
    ])
}
