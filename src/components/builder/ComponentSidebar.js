import { Droppable, Draggable } from '@hello-pangea/dnd';

const components = [
    { id: 'heading', label: 'Heading' },
    { id: 'paragraph', label: 'Paragraph' },
    { id: 'button', label: 'Button' },
    { id: 'image', label: 'Image' }
];

export default function ComponentSidebar() {
    return (
        <div className="w-64 bg-secondary p-4 border-r">
            <h2 className="text-lg font-semibold mb-4">Components</h2>
            <Droppable droppableId="sidebar" isDropDisabled={true}>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {components.map((component, index) => (
                            <Draggable
                                key={component.id}
                                draggableId={component.id}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-background p-3 mb-2 rounded-md cursor-move hover:bg-accent"
                                    >
                                        {component.label}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
} 