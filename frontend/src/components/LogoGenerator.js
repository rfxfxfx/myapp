import React, { useState } from 'react';
import { 
  Wand2, 
  Download, 
  Save, 
  Star, 
  Palette, 
  Type, 
  Sparkles,
  Building,
  Lightbulb,
  Heart,
  Zap
} from 'lucide-react';

const LogoGenerator = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    style: '',
    colors: '',
    description: ''
  });
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [savedLogos, setSavedLogos] = useState([]);

  const industries = [
    { value: 'technology', label: 'Technology', icon: Zap },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'finance', label: 'Finance', icon: Building },
    { value: 'education', label: 'Education', icon: Lightbulb },
    { value: 'retail', label: 'Retail', icon: Star },
    { value: 'food', label: 'Food & Beverage', icon: Star },
    { value: 'creative', label: 'Creative & Design', icon: Palette },
    { value: 'other', label: 'Other', icon: Sparkles }
  ];

  const styles = [
    'Modern & Minimalist',
    'Bold & Dynamic',
    'Elegant & Professional',
    'Playful & Creative',
    'Classic & Timeless',
    'Abstract & Artistic'
  ];

  const colorSchemes = [
    'Blue & White',
    'Black & White',
    'Red & Black',
    'Green & Blue',
    'Purple & Gold',
    'Orange & Gray',
    'Multicolor',
    'Monochrome'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateLogos = async () => {
    if (!formData.companyName.trim()) {
      setError('Please enter your company name');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-logo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: formData.companyName,
          industry: formData.industry,
          style: formData.style,
          colors: formData.colors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate logos');
      }

      const data = await response.json();
      setGeneratedLogos(data.logos);
    } catch (error) {
      console.error('Error generating logos:', error);
      setError('Failed to generate logos. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = (logoData, index) => {
    const link = document.createElement('a');
    link.href = logoData;
    link.download = `${formData.companyName}-logo-${index + 1}.png`;
    link.click();
  };

  const saveLogo = async (logoData, index) => {
    try {
      const logoProject = {
        logo_id: `logo-${Date.now()}-${index}`,
        name: `${formData.companyName} Logo ${index + 1}`,
        prompt: `${formData.companyName} logo in ${formData.style} style`,
        image_data: logoData,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logoProject),
      });

      if (response.ok) {
        setSavedLogos(prev => [...prev, logoProject]);
        alert('Logo saved successfully!');
      } else {
        throw new Error('Failed to save logo');
      }
    } catch (error) {
      console.error('Error saving logo:', error);
      alert('Error saving logo');
    }
  };

  const loadSavedLogos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logos`);
      if (response.ok) {
        const data = await response.json();
        setSavedLogos(data.logos);
      }
    } catch (error) {
      console.error('Error loading saved logos:', error);
    }
  };

  React.useEffect(() => {
    loadSavedLogos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">AI Logo Generator</h1>
        </div>
        <p className="text-lg text-slate-600">
          Create professional logos for your business with AI-powered design
        </p>
      </div>

      {/* Logo Generation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
          <Wand2 size={20} />
          <span>Design Your Logo</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Industry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {industries.map((industry) => {
                const IconComponent = industry.icon;
                return (
                  <button
                    key={industry.value}
                    onClick={() => handleInputChange('industry', industry.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      formData.industry === industry.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent size={16} />
                      <span className="text-sm font-medium">{industry.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Style Preference
            </label>
            <select
              value={formData.style}
              onChange={(e) => handleInputChange('style', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a style</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Color Scheme
            </label>
            <select
              value={formData.colors}
              onChange={(e) => handleInputChange('colors', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select colors</option>
              {colorSchemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="md:col-span-2">
            <button
              onClick={generateLogos}
              disabled={isGenerating}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Generating Your Logos...</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate Logos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Logos */}
      {generatedLogos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
            <Palette size={20} />
            <span>Your Generated Logos</span>
          </h3>
          
          <div className="logo-grid">
            {generatedLogos.map((logo, index) => (
              <div
                key={index}
                className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="aspect-square bg-white flex items-center justify-center p-4">
                  <img
                    src={logo}
                    alt={`${formData.companyName} Logo ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 mb-2">
                    {formData.companyName} Logo {index + 1}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadLogo(logo, index)}
                      className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => saveLogo(logo, index)}
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Logos */}
      {savedLogos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
            <Star size={20} />
            <span>Saved Logos</span>
          </h3>
          
          <div className="logo-grid">
            {savedLogos.map((logo, index) => (
              <div
                key={logo.logo_id}
                className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="aspect-square bg-white flex items-center justify-center p-4">
                  <img
                    src={logo.image_data}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 mb-1">{logo.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    {new Date(logo.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => downloadLogo(logo.image_data, index)}
                    className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
          <Lightbulb size={20} />
          <span>Logo Design Tips</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
          <div className="space-y-2">
            <p>• <strong>Keep it simple:</strong> Great logos are easily recognizable</p>
            <p>• <strong>Make it scalable:</strong> Should work at any size</p>
            <p>• <strong>Use appropriate colors:</strong> Consider your industry</p>
          </div>
          <div className="space-y-2">
            <p>• <strong>Be memorable:</strong> Unique but not overly complex</p>
            <p>• <strong>Stay timeless:</strong> Avoid trendy elements</p>
            <p>• <strong>Test different versions:</strong> Try multiple concepts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoGenerator;