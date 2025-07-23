import {DefaultMainMenu, DefaultMainMenuContent, Editor, TldrawUiMenuItem, TLUiActionItem, TLUiActionsContextType, TLUiMainMenuProps, TLUiOverrides, useDefaultHelpers, useEditor} from "tldraw";
import React from "react";
import {DBState} from "@/propagators/LocalDBState.ts";
import {name, version} from '../package.json';

export const snapshotKey = `${name}-${version}`;

export var hasSavedState = false; // Flag to indicate if the state has been saved

const blobIDKey = 'blobID';
const initialSnapshotURL = `https://malloc-deck-builder.val.run/?${blobIDKey}=${snapshotKey}`;
const initialTitle = window.document.title;


export function setSavedState(saved: boolean) {
    hasSavedState = saved;
    window.document.title = saved ? initialTitle : `${initialTitle} *`;
}


export async function LoadValTownState(): Promise<DBState> | null {
    try {
        let response = await fetch(initialSnapshotURL);
        return await response.json() as DBState;
    } catch (error) {
        console.error('Error fetching initial snapshot:', error);
        return null;
    }
}


export const CustomShortcuts: TLUiOverrides = {
    actions(_editor, actions, helpers): TLUiActionsContextType {

        const uploadStateAction: TLUiActionItem = {
            kbd: 'ctrl+s',
            onSelect(source) {
                uploadValTownState(_editor, helpers);
            },
            id: 'upload-state',
            label: 'Upload State',
            icon: 'external-link',
        }
        return {
            ...actions,
            'upload-state': uploadStateAction
        }
    }
}
export const CustomMainMenu: React.ComponentType<TLUiMainMenuProps> = (
    props: TLUiMainMenuProps
) => {
    const editor = useEditor();
    const helpers = useDefaultHelpers();
    return (
        <DefaultMainMenu {...props}>
            <DefaultMainMenuContent/>
            <TldrawUiMenuItem
                id="upload-state"
                label="Upload State"
                icon="external-link"
                readonlyOk
                onSelect={() => uploadValTownState(editor, helpers)}
            />
        </DefaultMainMenu>
    );
}


export function uploadValTownState(editor: Editor, helpers: ReturnType<typeof useDefaultHelpers>) {

    const editorState = editor.store.getStoreSnapshot();
    const editorDBState: DBState = {
        snapshot: editorState,
        id: snapshotKey,
        updatedAt: Date.now(),
    }
    const jsonData = JSON.stringify(editorDBState, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});

    fetch(initialSnapshotURL, {
        method: 'POST',
        body: blob,
    })
        .then(response => response.json())
        .then(data => {
            if (helpers !== undefined) {
                helpers.addToast({
                    title: 'Upload Successful',
                    description: 'State uploaded successfully!',
                    severity: 'info'
                });
            }
            setSavedState(true); // Set the flag to true after a successful upload
        })
        .catch(error => {
            console.error('Error uploading state:', error);
            alert('Failed to upload state.');
        });
}