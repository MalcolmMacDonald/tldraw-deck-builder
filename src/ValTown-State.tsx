import {
    DefaultMainMenu,
    DefaultMainMenuContent,
    Editor,
    TldrawUiMenuItem,
    TLStoreSnapshot,
    TLUiActionItem,
    TLUiActionsContextType,
    TLUiMainMenuProps,
    TLUiOverrides,
    useDefaultHelpers,
    useEditor
} from "tldraw";
import {version} from '../package.json';
import React from "react";


export var hasSavedState = false; // Flag to indicate if the state has been saved

const blobIDKey = 'blobID';
export const snapshotKey = `tldraw-deck-builder-${version}`;
const initialSnapshotURL = `https://malloc-deck-builder.val.run/?${blobIDKey}=${snapshotKey}`;
const initialTitle = window.document.title;

export function setSavedState(saved: boolean) {
    hasSavedState = saved;
    window.document.title = saved ? initialTitle : `${initialTitle} *`;
}

export async function LoadValTownState(): Promise<TLStoreSnapshot> | null {
    try {
        let response = await fetch(initialSnapshotURL);
        return await response.json() as TLStoreSnapshot;
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


function uploadValTownState(editor: Editor, helpers: ReturnType<typeof useDefaultHelpers>) {
    const editorState = editor.getSnapshot();
    const jsonData = JSON.stringify(editorState, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});

    fetch(initialSnapshotURL, {
        method: 'POST',
        body: blob,
    })
        .then(response => response.json())
        .then(data => {
            helpers.addToast({
                title: 'Upload Successful',
                description: 'State uploaded successfully!',
                severity: 'info'
            });
            setSavedState(true); // Set the flag to true after a successful upload
        })
        .catch(error => {
            console.error('Error uploading state:', error);
            alert('Failed to upload state.');
        });
}