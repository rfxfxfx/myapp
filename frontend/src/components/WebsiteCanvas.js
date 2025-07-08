import React from 'react';
import { useDrop } from 'react-dnd';
import { Trash2, Move, Edit3 } from 'lucide-react';

const WebsiteCanvas = ({ 
  components, 
  selectedComponent, 
  onSelectComponent, 
  onUpdateComponent, 
  onDeleteComponent, 
  onAddComponent 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.getElementById('canvas').getBoundingClientRect();
      const position = {
        x: offset.x - canvasRect.left,
        y: offset.y - canvasRect.top
      };
      onAddComponent(item.type, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      id="canvas"
      className={`
        relative w-full h-full min-h-[600px] canvas-area rounded-lg
        ${isOver ? 'bg-primary-50 border-2 border-dashed border-primary-300' : 'bg-white'}
        transition-all duration-200
      `}
    >
      {components.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Edit3 size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2">Start Building Your Website</h3>
            <p className="text-sm">
              Drag components from the toolbox or click to add them here
            </p>
          </div>
        </div>
      ) : (
        components.map((component) => (
          <CanvasComponent
            key={component.id}
            component={component}
            isSelected={selectedComponent === component.id}
            onSelect={() => onSelectComponent(component.id)}
            onUpdate={(updates) => onUpdateComponent(component.id, updates)}
            onDelete={() => onDeleteComponent(component.id)}
          />
        ))
      )}
    </div>
  );
};

const CanvasComponent = ({ component, isSelected, onSelect, onUpdate, onDelete }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore dragend event
    
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    onUpdate({ position: newPosition });
  };

  const renderComponent = () => {
    const style = {
      ...component.styles,
      position: 'absolute',
      left: component.position.x,
      top: component.position.y,
      cursor: 'move'
    };

    switch (component.type) {
      case 'text':
        const TextTag = component.props.tag || 'p';
        return (
          <TextTag style={style} className="component-wrapper">
            {component.props.content}
          </TextTag>
        );
      
      case 'heading':
        const HeadingTag = `h${component.props.level || 1}`;
        return React.createElement(
          HeadingTag,
          { style, className: 'component-wrapper' },
          component.props.content
        );
      
      case 'button':
        return (
          <button
            style={style}
            className="component-wrapper"
            onClick={(e) => e.preventDefault()}
          >
            {component.props.text}
          </button>
        );
      
      case 'image':
        return (
          <div style={style} className="component-wrapper">
            {component.props.src ? (
              <img 
                src={component.props.src} 
                alt={component.props.alt}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <div className="w-48 h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="w-8 h-8 mx-auto mb-2 bg-slate-200 rounded"></div>
                  <p className="text-xs">No image</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'section':
        return (
          <div style={style} className="component-wrapper">
            <h3 className="text-lg font-semibold mb-2">{component.props.title}</h3>
            <p>{component.props.content}</p>
          </div>
        );
      
      case 'form':
        return (
          <div style={style} className="component-wrapper">
            <h3 className="text-lg font-semibold mb-4">{component.props.title}</h3>
            <form className="space-y-4">
              {component.props.fields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                    {field}
                  </label>
                  {field === 'message' ? (
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows="4"
                      placeholder={`Enter your ${field}`}
                    />
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder={`Enter your ${field}`}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                onClick={(e) => e.preventDefault()}
              >
                Submit
              </button>
            </form>
          </div>
        );
      
      default:
        return (
          <div style={style} className="component-wrapper">
            <div className="p-4 bg-slate-100 border border-slate-300 rounded">
              Unknown component: {component.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        group relative
        ${isSelected ? 'component-selected' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
    >
      {renderComponent()}
      
      {/* Component controls */}
      {isSelected && (
        <div className="absolute -top-8 -right-2 flex items-center space-x-1 bg-white border border-slate-200 rounded-md shadow-lg p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete component"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WebsiteCanvas;