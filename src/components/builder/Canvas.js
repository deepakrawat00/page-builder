import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { X, Edit2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Canvas({ components, onDelete, onUpdate }) {
    return (
        <Droppable droppableId="canvas">
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[calc(100vh-2rem)] bg-background p-8 rounded-lg border-2 border-dashed"
                >
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
                                    className="relative group mb-4"
                                >
                                    <ComponentRenderer
                                        component={component}
                                        onUpdate={(newContent) => onUpdate(index, newContent)}
                                    />
                                    <div className="absolute -right-2 -top-2 hidden group-hover:flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => onDelete(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}

function ComponentRenderer({ component, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(component.content);
    const componentRef = useRef(null);

    // Initialize style with proper defaults and existing styles
    const [style, setStyle] = useState({
        // Typography
        fontSize: component.style?.fontSize || '16px',
        color: component.style?.color || '#000000',
        textAlign: component.style?.textAlign || 'left',
        fontWeight: component.style?.fontWeight || 'normal',
        lineHeight: component.style?.lineHeight || '1.6',

        // Spacing
        padding: component.style?.padding || '8px',
        marginBottom: component.style?.marginBottom || '16px',

        // Button specific
        backgroundColor: component.style?.backgroundColor || '#ffffff',
        borderRadius: component.style?.borderRadius || '4px',
        border: component.style?.border || 'none',

        // Image specific
        width: component.style?.width || 'auto',
        height: component.style?.height || 'auto',
        objectFit: component.style?.objectFit || 'contain',
        display: component.style?.display || 'block',

        // Merge any additional styles
        ...component.style
    });

    // Sync style with component changes
    useEffect(() => {
        if (component.style) {
            setStyle(prevStyle => ({
                ...prevStyle,
                ...component.style
            }));
        }
    }, [component.style]);

    useEffect(() => {
        setEditContent(component.content);
    }, [component.content]);

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleClickOutside = (e) => {
        if (componentRef.current && !componentRef.current.contains(e.target)) {
            setIsEditing(false);
            onUpdate({
                content: editContent,
                style: style
            });
        }
    };

    useEffect(() => {
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        onUpdate({
            content: editContent,
            style: style
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.target.blur();
        }
    };

    const handleStyleChange = (property, value) => {
        const newStyle = {
            ...style,
            [property]: value
        };
        setStyle(newStyle);

        // Immediately update the component
        onUpdate({
            content: editContent,
            style: newStyle
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditContent(reader.result);
                handleStyleChange('width', 'auto');
                handleStyleChange('height', 'auto');
                onUpdate({
                    content: reader.result,
                    style: {
                        ...style,
                        width: 'auto',
                        height: 'auto'
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const EditingControls = ({ componentType }) => {
        const commonControls = (
            <>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Font Size</label>
                    <select
                        value={style.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        className="w-full bg-background rounded px-2 py-1 mt-1"
                    >
                        <option value="12px">Small</option>
                        <option value="16px">Medium</option>
                        <option value="24px">Large</option>
                        <option value="32px">XLarge</option>
                        <option value="48px">XXLarge</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Text Color</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="color"
                            value={style.color || '#000000'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                            className="w-12 h-8 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={style.color || '#000000'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                            className="flex-1 bg-background rounded px-2 py-1"
                            placeholder="#000000"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Alignment</label>
                    <select
                        value={style.textAlign}
                        onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                        className="w-full bg-background rounded px-2 py-1 mt-1"
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            </>
        );

        const spacingControls = (
            <div className="flex gap-2 mt-2">
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Padding</label>
                    <input
                        type="number"
                        value={parseInt(style.padding) || 0}
                        onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                        className="w-full bg-background rounded px-2 py-1 mt-1"
                        min="0"
                        max="100"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Margin</label>
                    <input
                        type="number"
                        value={parseInt(style.marginBottom) || 0}
                        onChange={(e) => handleStyleChange('marginBottom', `${e.target.value}px`)}
                        className="w-full bg-background rounded px-2 py-1 mt-1"
                        min="0"
                        max="100"
                    />
                </div>
            </div>
        );

        const buttonControls = (
            <div className="flex gap-2 mt-2">
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Background Color</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="color"
                            value={style.backgroundColor || '#ffffff'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="w-12 h-8 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={style.backgroundColor || '#ffffff'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="flex-1 bg-background rounded px-2 py-1"
                            placeholder="#ffffff"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Border Radius</label>
                    <input
                        type="number"
                        value={parseInt(style.borderRadius) || 0}
                        onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                        className="w-full bg-background rounded px-2 py-1 mt-1"
                        min="0"
                        max="50"
                    />
                </div>
            </div>
        );

        return (
            <div
                className="flex flex-col gap-2 mb-4 p-4 bg-secondary rounded-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-2">
                    {commonControls}
                </div>
                {spacingControls}
                {componentType === 'button' && buttonControls}
                <Button
                    onClick={handleSave}
                    className="mt-4"
                >
                    Save Changes
                </Button>
            </div>
        );
    };

    switch (component.type) {
        case 'heading':
            return (
                <div ref={componentRef}>
                    {isEditing && <EditingControls componentType="heading" />}
                    {isEditing ? (
                        <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                ...style,
                                fontWeight: 'bold',
                            }}
                            className="w-full bg-transparent border-2 border-primary rounded-md focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <h2
                            style={{
                                ...component.style,
                                ...style,
                                fontWeight: 'bold',
                            }}
                            className="cursor-text hover:bg-accent/10 rounded-md"
                            onClick={handleClick}
                            onDoubleClick={handleDoubleClick}
                        >
                            {component.content}
                        </h2>
                    )}
                </div>
            );

        case 'paragraph':
            return (
                <div ref={componentRef}>
                    {isEditing && <EditingControls componentType="paragraph" />}
                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={style}
                            className="w-full bg-transparent border-2 border-primary rounded-md focus:outline-none min-h-[100px] resize-y"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <p
                            style={component.style || style}
                            className="cursor-text hover:bg-accent/10 rounded-md"
                            onClick={handleClick}
                            onDoubleClick={handleDoubleClick}
                        >
                            {component.content}
                        </p>
                    )}
                </div>
            );

        case 'button':
            return (
                <div ref={componentRef}>
                    {isEditing && <EditingControls componentType="button" />}
                    {isEditing ? (
                        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent border-2 border-primary rounded-md focus:outline-none"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button
                            style={component.style || style}
                            onClick={handleClick}
                            onDoubleClick={handleDoubleClick}
                            className="px-4 py-2 rounded-md transition-colors"
                        >
                            {component.content}
                        </button>
                    )}
                </div>
            );

        case 'image':
            return (
                <div ref={componentRef}>
                    {isEditing && (
                        <div
                            className="flex flex-col gap-2 mb-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full bg-transparent border-2 border-primary rounded-md px-2 py-1 focus:outline-none"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditContent('');
                                        const fileInput = document.createElement('input');
                                        fileInput.type = 'file';
                                        fileInput.accept = 'image/*';
                                        fileInput.onchange = (e) => handleFileChange(e);
                                        fileInput.click();
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onBlur={handleDoubleClick}
                                    placeholder="Or paste image URL"
                                    className="w-full bg-transparent border-2 border-primary rounded-md px-2 py-1 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-sm text-muted-foreground">Width</label>
                                    <input
                                        type="number"
                                        placeholder="Width (px)"
                                        value={style.width?.replace('px', '') || ''}
                                        onChange={(e) => handleStyleChange('width', `${e.target.value}px`)}
                                        onBlur={handleDoubleClick}
                                        className="w-full bg-background rounded px-2 py-1 mt-1"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-muted-foreground">Height</label>
                                    <input
                                        type="number"
                                        placeholder="Height (px)"
                                        value={style.height?.replace('px', '') || ''}
                                        onChange={(e) => handleStyleChange('height', `${e.target.value}px`)}
                                        onBlur={handleDoubleClick}
                                        className="w-full bg-background rounded px-2 py-1 mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className="relative group cursor-pointer"
                        onClick={handleClick}
                        onDoubleClick={handleDoubleClick}
                    >
                        {(isEditing ? editContent : component.content) ? (
                            <img
                                src={isEditing ? editContent : component.content}
                                alt="Component"
                                style={component.style || style}
                                className="max-w-full h-auto rounded-md"
                                onError={(e) => {
                                    e.target.src = 'https://docs.commercetools.com/frontend-studio/static/f01928f2c694c4f3372daf8bdb8d3c28/8201f/empty-page-builder-overview-new.png';
                                }}
                            />
                        ) : (
                            <div className="w-full h-32 bg-muted flex items-center justify-center rounded-md">
                                <span className="text-muted-foreground">No image selected</span>
                            </div>
                        )}
                        {!isEditing && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-md flex items-center justify-center">
                                <Edit2 className="hidden group-hover:block text-white" />
                            </div>
                        )}
                    </div>
                </div>
            );

        default:
            return null;
    }
} 