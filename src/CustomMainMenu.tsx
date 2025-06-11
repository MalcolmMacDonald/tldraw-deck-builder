import {
    DefaultMainMenu,
    DefaultMainMenuContent,
    Editor,
    TLContent,
    TldrawUiMenuItem,
    useEditor,
    useExportAs,
} from "tldraw";

export function CustomMainMenu() {
    const editor = useEditor()
    const exportAs = useExportAs()

    const importJSON = (editor: Editor) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target.result !== 'string') {
                    return
                }
                const jsonData = JSON.parse(event.target.result) as TLContent
                editor.putContentOntoCurrentPage(jsonData, {select: true})
            };
            reader.readAsText(file);
        };
        input.click();
    };
    const exportJSON = (editor: Editor) => {
        const exportName = `props-${Math.round(+new Date() / 1000).toString().slice(5)}`
        exportAs(Array.from(editor.getCurrentPageShapeIds()), 'json', exportName)
    };

    const uploadState = (editor: Editor) => {
        const editorState = editor.getSnapshot();
        const jsonData = JSON.stringify(editorState, null, 2);
        const blob = new Blob([jsonData], {type: 'application/json'});
        const valtownURL = `https://malloc-deck-builder.val.run/`;

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

    return (
        <DefaultMainMenu>
            <DefaultMainMenuContent/>
            <TldrawUiMenuItem
                id="export"
                label="Export JSON"
                icon="external-link"
                readonlyOk
                onSelect={() => exportJSON(editor)}
            />
            <TldrawUiMenuItem
                id="import"
                label="Import JSON"
                icon="external-link"
                readonlyOk
                onSelect={() => importJSON(editor)}
            />
            <TldrawUiMenuItem
                id="upload-state"
                label="Upload State"
                icon="external-link"
                readonlyOk
                onSelect={() => uploadState(editor)}
            />
        </DefaultMainMenu>
    )
}
