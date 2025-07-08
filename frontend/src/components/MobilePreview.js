import React from 'react';

const MobilePreview = ({ components, selectedComponent, onSelectComponent }) => {
  const renderComponent = (component) => {
    const style = {
      ...component.styles,
      position: 'relative',
      left: 'auto',
      top: 'auto',
      marginBottom: '16px'
    };

    switch (component.type) {
      case 'text':
        const TextTag = component.props.tag || 'p';
        return (
          <TextTag key={component.id} style={style}>
            {component.props.content}
          </TextTag>
        );
      
      case 'heading':
        const HeadingTag = `h${component.props.level || 1}`;
        return React.createElement(
          HeadingTag,
          { key: component.id, style },
          component.props.content
        );
      
      case 'button':
        return (
          <button
            key={component.id}
            style={style}
            className="w-full"
            onClick={(e) => e.preventDefault()}
          >
            {component.props.text}
          </button>
        );
      
      case 'image':
        return (
          <div key={component.id} style={style}>
            {component.props.src ? (
              <img 
                src={component.props.src} 
                alt={component.props.alt}
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <div className="w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="w-12 h-12 mx-auto mb-2 bg-slate-200 rounded"></div>
                  <p className="text-sm">No image</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'section':
        return (
          <div key={component.id} style={style}>
            <h3 className="text-lg font-semibold mb-2">{component.props.title}</h3>
            <p>{component.props.content}</p>
          </div>
        );
      
      case 'form':
        return (
          <div key={component.id} style={style}>
            <h3 className="text-lg font-semibold mb-4">{component.props.title}</h3>
            <form className="space-y-4">
              {component.props.fields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                    {field}
                  </label>
                  {field === 'message' ? (
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      rows="3"
                      placeholder={`Enter your ${field}`}
                    />
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      placeholder={`Enter your ${field}`}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                onClick={(e) => e.preventDefault()}
              >
                Submit
              </button>
            </form>
          </div>
        );
      
      default:
        return (
          <div key={component.id} style={style}>
            <div className="p-4 bg-slate-100 border border-slate-300 rounded">
              Unknown component: {component.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mobile-preview">
      <div className="p-4 h-full overflow-auto">
        {components.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                📱
              </div>
              <h3 className="text-sm font-medium mb-2">Mobile Preview</h3>
              <p className="text-xs">
                Add components to see mobile view
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {components.map((component) => (
              <div
                key={component.id}
                className={`
                  cursor-pointer transition-all duration-200
                  ${selectedComponent === component.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                  hover:shadow-md
                `}
                onClick={() => onSelectComponent(component.id)}
              >
                {renderComponent(component)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePreview;