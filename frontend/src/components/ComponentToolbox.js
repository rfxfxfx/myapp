import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Heading, 
  MousePointer, 
  Image, 
  Square, 
  FileText,
  Layout,
  Palette
} from 'lucide-react';

const ComponentToolbox = ({ onAddComponent }) => {
  const components = [
    {
      type: 'text',
      name: 'Text',
      icon: Type,
      description: 'Add text content',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      type: 'heading',
      name: 'Heading',
      icon: Heading,
      description: 'Add heading text',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      type: 'button',
      name: 'Button',
      icon: MousePointer,
      description: 'Add interactive button',
      color: 'text-green-600 bg-green-50'
    },
    {
      type: 'image',
      name: 'Image',
      icon: Image,
      description: 'Add image or photo',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      type: 'section',
      name: 'Section',
      icon: Layout,
      description: 'Add content section',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      type: 'form',
      name: 'Form',
      icon: FileText,
      description: 'Add contact form',
      color: 'text-pink-600 bg-pink-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <Palette size={18} />
          <span>Components</span>
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Drag components to your canvas or click to add
        </p>
      </div>
      
      <div className="p-4 space-y-2">
        {components.map((component) => (
          <DraggableComponent
            key={component.type}
            component={component}
            onAddComponent={onAddComponent}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Drag components to canvas</li>
            <li>• Click to add at default position</li>
            <li>• Use AI Images for custom photos</li>
            <li>• Export to HTML when ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DraggableComponent = ({ component, onAddComponent }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const IconComponent = component.icon;

  return (
    <div
      ref={drag}
      onClick={() => onAddComponent(component.type)}
      className={`
        p-3 rounded-lg border-2 border-dashed border-slate-200 cursor-pointer
        transition-all duration-200 hover:border-primary-300 hover:bg-primary-50
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${component.color}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <IconComponent size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900">
            {component.name}
          </h4>
          <p className="text-xs text-slate-600">
            {component.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentToolbox;