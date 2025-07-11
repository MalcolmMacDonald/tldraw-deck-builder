import {Editor, TLArrowBinding, TLArrowShape, Tldraw, TLShape, TLStoreSnapshot} from 'tldraw'
import {registerDefaultPropagators} from '@/propagators/ScopedPropagators'
import React from "react";
import {CustomMainMenu, CustomShortcuts, LoadValTownState, setSavedState, snapshotKey} from "@/ValTown-State.tsx";
import {CustomComponents} from "@/propagators/ShapeActionsButtons";
import {isShapeOfType} from "@/propagators/utils.ts";

export default function YjsExample() {
    //fetch  the initial snapshot from the JSON file
    const [initialSnapshot, setInitialSnapshot] = React.useState<TLStoreSnapshot | null>(null);

    React.useEffect(() => {
        LoadValTownState()
            .then(valTownSnapshot => {
                setInitialSnapshot(valTownSnapshot);
            })
            .catch(error => console.error('Error fetching initial snapshot:', error));
    }, []);
    return (
        <div className="tldraw__editor">
            <Tldraw
                isShapeHidden={(shape, editor) => {
                    //if shape is an arrow and is pointing from a shape with "hide arrows" meta property, hide it
                    return arrowIsHidden(shape, editor);
                }}
                components={{
                    MainMenu: CustomMainMenu,
                    InFrontOfTheCanvas: CustomComponents,
                }}
                overrides={
                    CustomShortcuts
                }
                onMount={onMount}
                snapshot={initialSnapshot}
                persistenceKey={snapshotKey}
            />
        </div>
    )
}

function arrowIsHidden(shape: TLShape, editor: Editor) {
    if (!isShapeOfType<TLArrowShape>(shape, 'arrow')) return false;
    const bindings = editor.getBindingsInvolvingShape(shape.id) as TLArrowBinding[];

    return bindings.filter(binding => binding.props.terminal === "start").some(binding => {
        const fromShape = editor.getShape(binding.toId);
        const hideArrows = fromShape.meta?.hideArrows;
        return hideArrows === true;
    });
}

function onMount(editor: Editor) {
    setSavedState(true);
    editor.store.listen(() => {
        setSavedState(false);
    }, {scope: 'document', source: 'user'});

    //@ts-expect-error
    window.editor = editor
    // stop double click text creation
    // @ts-expect-error
    editor.getStateDescendant('select.idle').handleDoubleClickOnCanvas = () => void null;
    registerDefaultPropagators(editor);
}
