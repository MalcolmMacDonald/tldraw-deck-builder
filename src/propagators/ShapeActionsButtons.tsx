import {stopEventPropagation, TLShape, useEditor, useValue,} from 'tldraw'
import 'tldraw/tldraw.css'
import {ShapeAction} from '@/propagators/ScopedPropagators'


//shape actions array:
type SelectionInfo = {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    actions: ShapeAction[]
    shapes: TLShape[]
}

export function CustomComponents() {
    const editor = useEditor()


    const info: SelectionInfo = useValue(
        'selection bounds',
        () => {
            const screenBounds = editor.getViewportScreenBounds()
            const rotation = editor.getSelectionRotation()
            const rotatedScreenBounds = editor.getSelectionRotatedScreenBounds()
            const shapes = editor.getSelectedShapes();
            const shapeActions: ShapeAction[] = shapes.map(shape => {
                return shape.meta['actions'] as ShapeAction[] || []
            }).flat().filter(action => action.scope === 'button');
            if (!rotatedScreenBounds) return
            return {
                // we really want the position within the
                // tldraw component's bounds, not the screen itself
                x: rotatedScreenBounds.x - screenBounds.x,
                y: rotatedScreenBounds.y - screenBounds.y,
                width: rotatedScreenBounds.width,
                height: rotatedScreenBounds.height,
                rotation: rotation,
                actions: shapeActions,
                shapes: shapes,
            }
        },
        [editor]
    )

    if (!info) return

    const actionButtons = info.actions.length === 0 ? null : info.actions.map((action, index) => (
        <button
            key={index}
            style={{
                pointerEvents: 'all',
                width: 'fit-content',
                height: 'fit-content',
                margin: '0 4px',
            }}
            onPointerDown={stopEventPropagation}
            onClick={() => {
                editor.run(() => {
                        new Function(action.code)();
                        editor.updateShapes(info.shapes);
                    }
                )
            }}
        >
            {action.name}
        </button>
    ))

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transformOrigin: 'top left',
                transform: `translate(${info.x}px, ${info.y}px) rotate(${info.rotation}rad) translate(0px, ${info.height + 8}px)`,
                pointerEvents: 'all',
                width: info.width,
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',

            }}
            onPointerDown={stopEventPropagation}
        >
            {actionButtons}
        </div>
    )
}