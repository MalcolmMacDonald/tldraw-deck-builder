import {stopEventPropagation, TLShape, useEditor, useValue,} from 'tldraw'
import 'tldraw/tldraw.css'
import {getShapeActions, packShape, ShapeAction, unpackShape} from '@/propagators/ScopedPropagators'
import {Geo} from "@/propagators/Geo.ts";
import {DeltaTime} from "@/propagators/DeltaTime.ts";


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
    const geo = new Geo(editor);


    const info: SelectionInfo = useValue(
        'selection bounds',
        () => {
            const screenBounds = editor.getViewportScreenBounds()
            const rotation = editor.getSelectionRotation()
            const rotatedScreenBounds = editor.getSelectionRotatedScreenBounds()
            const shapes = editor.getSelectedShapes();
            const shapeActions: ShapeAction[] = shapes.map(getShapeActions).flat()
                .filter(action => action.scope === 'button');
            if (shapeActions.length === 0) return null
            if (!rotatedScreenBounds) return null
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
    if (info.actions == null || info.actions.length === 0) return null;

    const actionButtons = info.actions.map((action, index) => (
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
                editor.run(async () => {
                    for (const action of info.actions) {
                        const actionShape = editor.getShape(action.shapeID);
                        const bounds = editor.getShapePageBounds(action.shapeID);
                        const toShapePacked = packShape(actionShape);
                        if (!actionShape || !bounds) continue;
                        try {

                            const result = await action.func(editor, toShapePacked, toShapePacked, geo, bounds, DeltaTime.dt, unpackShape);
                            if (result) {
                                editor.updateShape(unpackShape({
                                    ...toShapePacked,
                                    ...result
                                }))
                            }
                        } catch (e) {
                            console.error(`Error executing action ${action.name} on shape ${actionShape.id}`, e);
                        }
                    }
                });
            }
            }
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