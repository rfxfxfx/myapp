import React, { useState, useEffect } from 'react';
import { Folder, Plus, Edit3, Trash2, Calendar } from 'lucide-react';

const ProjectManager = ({ currentProject, onLoadProject, onNewProject }) => {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    const newProject = {
      project_id: `project-${Date.now()}`,
      name: newProjectName,
      components: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setProjects(prev => [...prev, newProject]);
        setShowCreateModal(false);
        setNewProjectName('');
        onNewProject(newProject);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.project_id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.project_id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              currentProject.project_id === project.project_id
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => onLoadProject(project)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder size={20} className="text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900">{project.name}</h4>
                  <p className="text-sm text-slate-600 flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.project_id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;