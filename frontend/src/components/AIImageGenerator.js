import React, { useState } from 'react';
import { X, Wand2, Download, Plus } from 'lucide-react';

const AIImageGenerator = ({ onClose, onAddImage }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateImages = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your image');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          count: 4
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      setGeneratedImages(data.images);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageData, index) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `generated-image-${index + 1}.png`;
    link.click();
  };

  const addImageToCanvas = (imageData) => {
    onAddImage(imageData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI Image Generator</h2>
              <p className="text-sm text-slate-600">Generate custom images with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe the image you want to generate
            </label>
            <div className="flex space-x-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A modern office building at sunset with glass windows, professional photography style"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />
              <button
                onClick={generateImages}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Generated Images
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button
                          onClick={() => addImageToCanvas(image)}
                          className="px-3 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-100 transition-colors flex items-center space-x-1"
                        >
                          <Plus size={16} />
                          <span>Add to Canvas</span>
                        </button>
                        <button
                          onClick={() => downloadImage(image, index)}
                          className="px-3 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-100 transition-colors flex items-center space-x-1"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for better results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about style, lighting, and composition</li>
              <li>• Include keywords like "professional", "modern", "minimalist"</li>
              <li>• Mention the type of image (photo, illustration, logo)</li>
              <li>• Add details about colors, mood, or setting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageGenerator;