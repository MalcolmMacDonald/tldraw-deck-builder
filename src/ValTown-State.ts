import {Editor, TLStoreSnapshot} from "tldraw";

const initialSnapshotURL = 'https://malloc-deck-builder.val.run/';
//fetch  the initial snapshot from the JSON file

export default function loadValTownState() {
    return fetch(initialSnapshotURL)
        .then(response => response.json())
        .then(data => data as TLStoreSnapshot)
        .catch(error => {
            console.error('Error fetching initial snapshot:', error);
            return null;
        });
}

export function uploadValTownState(editor: Editor) {
    const editorState = editor.getSnapshot();
    const jsonData = JSON.stringify(editorState, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const valtownURL = initialSnapshotURL;

    fetch(valtownURL, {
        method: 'POST',
        body: blob,
    })
        .then(response => response.json())
        .then(data => {
            console.log('Upload successful:', data);
            alert('State uploaded successfully!');
        })
        .catch(error => {
            console.error('Error uploading state:', error);
            alert('Failed to upload state.');
        });
}