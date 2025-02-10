'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import ComponentSidebar from '@/components/builder/ComponentSidebar';
import Canvas from '@/components/builder/Canvas';
import { exportToZip } from '@/lib/export';

// Add this function to handle default content for each component type
const getDefaultContent = (type) => {
    switch (type) {
        case 'heading':
            return 'New Heading';
        case 'paragraph':
            return 'Click to edit this paragraph text.';
        case 'button':
            return 'Click Me';
        case 'image':
            return 'https://docs.commercetools.com/frontend-studio/static/f01928f2c694c4f3372daf8bdb8d3c28/8201f/empty-page-builder-overview-new.png';
        default:
            return '';
    }
};

export default function Builder() {
    const [components, setComponents] = useState([]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.droppableId === 'sidebar' && destination.droppableId === 'canvas') {
            const newComponent = {
                id: `${result.draggableId}-${Date.now()}`,
                type: result.draggableId,
                content: getDefaultContent(result.draggableId),
                style: getDefaultStyles(result.draggableId)
            };

            const newComponents = Array.from(components);
            newComponents.splice(destination.index, 0, newComponent);
            setComponents(newComponents);
        } else if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
            const newComponents = Array.from(components);
            const [removed] = newComponents.splice(source.index, 1);
            newComponents.splice(destination.index, 0, removed);
            setComponents(newComponents);
        }
    };

    const handleDelete = (index) => {
        const newComponents = Array.from(components);
        newComponents.splice(index, 1);
        setComponents(newComponents);
    };

    const handleUpdate = (index, updates) => {
        const newComponents = Array.from(components);
        newComponents[index] = {
            ...newComponents[index],
            content: updates.content,
            style: updates.style
        };
        setComponents(newComponents);
    };

    const handleExport = async () => {
        await exportToZip(components);
    };

    // Add this function to provide default styles
    const getDefaultStyles = (type) => {
        switch (type) {
            case 'heading':
                return {
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: '1rem'
                };
            case 'paragraph':
                return {
                    fontSize: '1rem',
                    color: '#666666',
                    lineHeight: '1.6',
                    marginBottom: '1rem'
                };
            case 'button':
                return {
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0070f3',
                    color: '#ffffff',
                    borderRadius: '0.25rem',
                    border: 'none'
                };
            case 'image':
                return {
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    marginBottom: '1rem'
                };
            default:
                return {};
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-screen">
                <ComponentSidebar />
                <div className="flex-1 p-4">
                    <Canvas
                        components={components}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                    <Button
                        onClick={handleExport}
                        className="fixed bottom-4 right-4"
                    >
                        Export
                    </Button>
                </div>
            </div>
        </DragDropContext>
    );
} 