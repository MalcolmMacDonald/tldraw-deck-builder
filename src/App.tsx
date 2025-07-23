import {Editor, TLArrowBinding, TLArrowShape, Tldraw, TLShape} from 'tldraw'
import {registerDefaultPropagators} from '@/propagators/ScopedPropagators'
import React, {useEffect, useState} from "react";
import {CustomMainMenu, CustomShortcuts, hasSavedState, LoadValTownState, setSavedState, snapshotKey, uploadValTownState} from "@/ValTown-State.tsx";
import {CustomComponents} from "@/propagators/ShapeActionsButtons";
import {isShapeOfType} from "@/propagators/utils.ts";
import {GetDBSnapshot} from "@/propagators/LocalDBState.ts";


export default function YjsExample() {
    //fetch  the initial snapshot from the JSON file


    const [snapshot, setSnapshot] = useState(null)

    useEffect(() => {
        let cancelled = false

        console.log('Loading initial snapshot...');
        Promise.all([GetDBSnapshot(), LoadValTownState()]).then(([dbSnapshot, valTownSnapshot]) => {

            if (!dbSnapshot && valTownSnapshot) {
                console.log('Using ValTown snapshot as fallback');
                setSnapshot(valTownSnapshot.snapshot);
                return;
            } else if (dbSnapshot && !valTownSnapshot) {
                console.log('Using local DB snapshot as fallback');
                setSnapshot(dbSnapshot.snapshot);
                return;
            } else if (!dbSnapshot && !valTownSnapshot) {
                console.error('No snapshots available, cannot load editor state');
                return;
            }


            if (cancelled) {
                console.log('Loading cancelled');
                return;
            }
            const dbUpdatedAt = new Date(dbSnapshot.updatedAt);
            const valtownUpdatedAt = new Date(valTownSnapshot.updatedAt + 10);//new Date(valTownSnapshot.updatedAt);

            if (dbUpdatedAt > valtownUpdatedAt) {
                console.log('Using local DB snapshot:', dbSnapshot.id, 'at', dbUpdatedAt);
                setSnapshot(dbSnapshot.snapshot);
            } else {
                console.log('Using ValTown snapshot');
                setSnapshot(valTownSnapshot.snapshot);
            }
        });

        return () => {
            console.log('Cleaning up...');
            cancelled = true;
            // any cleanup logic if needed
        }

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
                persistenceKey={snapshotKey}
                snapshot={snapshot}
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


    //every 10 seconds, if the state is not saved, save it
    setInterval(() => {
        if (!hasSavedState) {
            uploadValTownState(editor, undefined);
        }
    }, 5000);


    //@ts-expect-error
    window.editor = editor
    // stop double click text creation
    // @ts-expect-error
    editor.getStateDescendant('select.idle').handleDoubleClickOnCanvas = () => void null;
    registerDefaultPropagators(editor);
}
