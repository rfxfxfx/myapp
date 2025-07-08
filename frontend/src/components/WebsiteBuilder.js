import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import ComponentToolbox from './ComponentToolbox';
import WebsiteCanvas from './WebsiteCanvas';
import MobilePreview from './MobilePreview';
import ProjectManager from './ProjectManager';
import AIImageGenerator from './AIImageGenerator';
import { 
  Save, 
  Eye, 
  Smartphone, 
  Monitor, 
  Download, 
  Plus,
  Settings,
  Layers
} from 'lucide-react';

const WebsiteBuilder = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    project_id: uuidv4(),
    name: 'New Website',
    components: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Save project to backend
  const saveProject = async () => {
    try {
      const projectData = {
        ...currentProject,
        components: components,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        alert('Project saved successfully!');
      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  // Add component to canvas
  const addComponent = (componentType, position = null) => {
    const newComponent = {
      id: uuidv4(),
      type: componentType,
      position: position || { x: 50, y: 50 },
      props: getDefaultProps(componentType),
      styles: getDefaultStyles(componentType)
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  // Get default props for component type
  const getDefaultProps = (type) => {
    switch (type) {
      case 'text':
        return { content: 'Your text here', tag: 'p' };
      case 'heading':
        return { content: 'Your Heading', level: 1 };
      case 'button':
        return { text: 'Button', link: '#' };
      case 'image':
        return { src: '', alt: 'Image', caption: '' };
      case 'section':
        return { title: 'Section Title', content: 'Section content' };
      case 'form':
        return { title: 'Contact Form', fields: ['name', 'email', 'message'] };
      default:
        return {};
    }
  };

  // Get default styles for component type
  const getDefaultStyles = (type) => {
    const baseStyles = {
      padding: '16px',
      margin: '8px',
      borderRadius: '8px',
      backgroundColor: 'transparent'
    };

    switch (type) {
      case 'text':
        return { ...baseStyles, fontSize: '16px', color: '#374151' };
      case 'heading':
        return { ...baseStyles, fontSize: '32px', fontWeight: 'bold', color: '#1f2937' };
      case 'button':
        return { 
          ...baseStyles, 
          backgroundColor: '#0ea5e9', 
          color: 'white', 
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          display: 'inline-block',
          padding: '12px 24px'
        };
      case 'image':
        return { ...baseStyles, maxWidth: '100%', height: 'auto' };
      case 'section':
        return { 
          ...baseStyles, 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0',
          minHeight: '200px'
        };
      default:
        return baseStyles;
    }
  };

  // Update component
  const updateComponent = (id, updates) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };

  // Delete component
  const deleteComponent = (id) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  // Generate HTML export
  const exportHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentProject.name}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .component { position: relative; }
        @media (max-width: 768px) {
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${components.map(comp => `
            <div class="component" style="${Object.entries(comp.styles).map(([key, value]) => 
              `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
            ).join('; ')}">
                ${renderComponentHTML(comp)}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render component HTML for export
  const renderComponentHTML = (component) => {
    switch (component.type) {
      case 'text':
        return `<${component.props.tag}>${component.props.content}</${component.props.tag}>`;
      case 'heading':
        return `<h${component.props.level}>${component.props.content}</h${component.props.level}>`;
      case 'button':
        return `<button onclick="window.open('${component.props.link}', '_blank')">${component.props.text}</button>`;
      case 'image':
        return `<img src="${component.props.src}" alt="${component.props.alt}" />`;
      case 'section':
        return `<section><h3>${component.props.title}</h3><p>${component.props.content}</p></section>`;
      default:
        return `<div>Component: ${component.type}</div>`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Component Toolbox */}
      <div className="lg:col-span-1">
        <ComponentToolbox onAddComponent={addComponent} />
      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
          {/* Canvas Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentProject.name}
              </h2>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md ${
                    previewMode === 'desktop' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md ${
                    previewMode === 'mobile' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowImageGenerator(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
              >
                <Plus size={16} />
                <span>AI Images</span>
              </button>
              <button
                onClick={saveProject}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={exportHTML}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4">
            {previewMode === 'desktop' ? (
              <WebsiteCanvas
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onUpdateComponent={updateComponent}
                onDeleteComponent={deleteComponent}
                onAddComponent={addComponent}
              />
            ) : (
              <div className="flex justify-center">
                <MobilePreview
                  components={components}
                  selectedComponent={selectedComponent}
                  onSelectComponent={setSelectedComponent}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Settings size={18} />
              <span>Properties</span>
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {selectedComponent ? (
              <ComponentProperties
                component={components.find(c => c.id === selectedComponent)}
                onUpdate={(updates) => updateComponent(selectedComponent, updates)}
              />
            ) : (
              <div className="text-center text-slate-500 py-8">
                <Layers size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Select a component to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Image Generator Modal */}
      {showImageGenerator && (
        <AIImageGenerator
          onClose={() => setShowImageGenerator(false)}
          onAddImage={(imageData) => {
            addComponent('image', null);
            // Update the last added image component with the generated image
            const lastComponent = components[components.length - 1];
            if (lastComponent && lastComponent.type === 'image') {
              updateComponent(lastComponent.id, {
                props: { ...lastComponent.props, src: imageData }
              });
            }
          }}
        />
      )}
    </div>
  );
};

// Component Properties Editor
const ComponentProperties = ({ component, onUpdate }) => {
  if (!component) return null;

  const updateProp = (key, value) => {
    onUpdate({ props: { ...component.props, [key]: value } });
  };

  const updateStyle = (key, value) => {
    onUpdate({ styles: { ...component.styles, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Component Type
        </label>
        <div className="px-3 py-2 bg-slate-50 rounded-md text-sm text-slate-600 capitalize">
          {component.type}
        </div>
      </div>

      {/* Component-specific properties */}
      {component.type === 'text' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <textarea
              value={component.props.content}
              onChange={(e) => updateProp('content', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tag
            </label>
            <select
              value={component.props.tag}
              onChange={(e) => updateProp('tag', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="p">Paragraph</option>
              <option value="span">Span</option>
              <option value="div">Div</option>
            </select>
          </div>
        </>
      )}

      {component.type === 'heading' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Heading Text
            </label>
            <input
              type="text"
              value={component.props.content}
              onChange={(e) => updateProp('content', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Heading Level
            </label>
            <select
              value={component.props.level}
              onChange={(e) => updateProp('level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>H{level}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {component.type === 'button' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={component.props.text}
              onChange={(e) => updateProp('text', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={component.props.link}
              onChange={(e) => updateProp('link', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </>
      )}

      {component.type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={component.props.src}
              onChange={(e) => updateProp('src', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={component.props.alt}
              onChange={(e) => updateProp('alt', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </>
      )}

      {/* Style properties */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Styling</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Padding</label>
            <input
              type="text"
              value={component.styles.padding}
              onChange={(e) => updateStyle('padding', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Margin</label>
            <input
              type="text"
              value={component.styles.margin}
              onChange={(e) => updateStyle('margin', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Background</label>
            <input
              type="text"
              value={component.styles.backgroundColor}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Text Color</label>
            <input
              type="text"
              value={component.styles.color}
              onChange={(e) => updateStyle('color', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;