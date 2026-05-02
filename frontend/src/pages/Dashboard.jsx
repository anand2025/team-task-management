import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api';
import { useAuth } from '../App';
import { LayoutGrid, Plus, Users, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projRes, statRes] = await Promise.all([
        projectApi.list(),
        projectApi.getStats()
      ]);
      setProjects(projRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectApi.create({ name: newProjectName, description: '' });
      setNewProjectName('');
      setShowNewProject(false);
      loadData();
    } catch (err) {
      alert('Only Admins can create projects');
    }
  };

  return (
    <div className="container animate-fade" style={{paddingTop: '40px', paddingBottom: '80px'}}>
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div style={{background: 'var(--primary)', padding: '8px', borderRadius: '12px'}}>
            <LayoutGrid color="white" />
          </div>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div style={{textAlign: 'right'}}>
            <p style={{fontWeight: '600'}}>{user?.full_name}</p>
            <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{user?.role.toUpperCase()}</p>
          </div>
          <button onClick={logout} style={{background: 'var(--glass)', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)'}}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div className="glass-card flex items-center gap-4">
          <div style={{background: 'rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '12px'}}>
            <LayoutGrid color="var(--primary)" />
          </div>
          <div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Projects</p>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{stats?.total_projects || 0}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px'}}>
            <CheckCircle2 color="var(--success)" />
          </div>
          <div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Total Tasks</p>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{stats?.total_tasks || 0}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div style={{background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px'}}>
            <AlertCircle color="var(--warning)" />
          </div>
          <div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Pending</p>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{stats?.pending_tasks || 0}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div style={{background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px'}}>
            <AlertCircle color="var(--danger)" />
          </div>
          <div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Overdue</p>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{stats?.overdue_tasks || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-10">
        <h2 style={{fontSize: '1.5rem', fontWeight: '700'}}>My Projects</h2>
        {user?.role === 'admin' && (
          <button onClick={() => setShowNewProject(true)} className="btn-primary flex items-center gap-2" style={{height: '44px'}}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {showNewProject && (
        <div className="glass-card mb-12 animate-fade" style={{padding: '30px'}}>
          <form onSubmit={handleCreateProject} className="flex gap-4">
            <input 
              placeholder="Project Name" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{width: '120px'}}>Create</button>
            <button type="button" onClick={() => setShowNewProject(false)} style={{background: 'transparent', color: 'var(--text-main)', fontWeight: '600'}}>Cancel</button>
          </form>
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px'}}>
        {projects.map(project => (
          <Link key={project.id} to={`/projects/${project.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="glass-card" style={{transition: 'transform 0.2s', cursor: 'pointer'}} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <h3 style={{marginBottom: '12px'}}>{project.name}</h3>
              <div className="flex items-center gap-4 text-muted" style={{fontSize: '0.875rem'}}>
                <span className="flex items-center gap-1"><Users size={14} /> {project.members.length} Members</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {project.tasks.length} Tasks</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
