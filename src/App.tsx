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

const initialSnapshotURL = './InitialState.json';

export default function YjsExample() {
    //fetch  the initial snapshot from the JSON file
    const [initialSnapshot, setInitialSnapshot] = React.useState<TLStoreSnapshot | null>(null)
    React.useEffect(() => {
        fetch(initialSnapshotURL)
            .then(response => response.json())
            .then(data => setInitialSnapshot(data as TLStoreSnapshot))
            .catch(error => console.error('Error fetching initial snapshot:', error));
    }, []);
    return (
        <div className="tldraw__editor">
            <Tldraw
                components={{
                    MainMenu: CustomMainMenu,
                }}
                onMount={onMount}
                snapshot={initialSnapshot as TLStoreSnapshot}
                persistenceKey='async-async-scoped-propagators'
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
