import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectApi, taskApi } from '../api';
import { useAuth } from '../App';
import { ChevronLeft, Plus, UserPlus, Clock, CheckCircle2 } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee_id: null });
  const { user } = useAuth();

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const { data } = await projectApi.list();
      const p = data.find(p => p.id === parseInt(id));
      setProject(p);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await taskApi.create(id, newTask);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowTaskForm(false);
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectApi.addMember(id, memberEmail);
      setMemberEmail('');
      setShowMemberForm(false);
      loadProject();
    } catch (err) {
      alert('Error adding member. Ensure email is correct and you are an admin.');
    }
  };

  const updateStatus = async (taskId, currentStatus) => {
    const statuses = ['todo', 'in_progress', 'completed'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % 3];
    try {
      await taskApi.update(taskId, { status: nextStatus });
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade" style={{paddingTop: '40px', paddingBottom: '80px'}}>
      <Link to="/" className="flex items-center gap-1 mb-8" style={{textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600'}}>
        <ChevronLeft size={20} /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em'}}>{project.name}</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>{project.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-4">
          {user?.role === 'admin' && (
            <button onClick={() => setShowMemberForm(!showMemberForm)} className="btn-primary flex items-center gap-2" style={{background: 'white', color: 'var(--text-main)', border: '1px solid var(--border)', height: '44px'}}>
              <UserPlus size={18} /> Add Member
            </button>
          )}
          <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary flex items-center gap-2" style={{height: '44px'}}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {showMemberForm && (
        <div className="glass-card mb-12 animate-fade" style={{padding: '30px'}}>
          <form onSubmit={handleAddMember} className="flex gap-4">
            <input 
              type="email"
              placeholder="Member Email" 
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{width: '120px'}}>Add</button>
          </form>
        </div>
      )}

      {showTaskForm && (
        <div className="glass-card mb-12 animate-fade" style={{padding: '30px'}}>
          <form onSubmit={handleAddTask} className="flex flex-col gap-5">
            <h3 style={{fontSize: '1.25rem', fontWeight: '700'}}>Create New Task</h3>
            <div className="flex flex-col gap-1.5">
              <label style={{fontSize: '0.85rem', fontWeight: '600'}}>TASK TITLE</label>
              <input 
                placeholder="What needs to be done?" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{fontSize: '0.85rem', fontWeight: '600'}}>DESCRIPTION</label>
              <textarea 
                placeholder="Add some details..." 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows={3}
              />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="flex flex-col gap-1.5">
                <label style={{fontSize: '0.85rem', fontWeight: '600'}}>PRIORITY</label>
                <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{fontSize: '0.85rem', fontWeight: '600'}}>ASSIGN TO</label>
                <select value={newTask.assignee_id || ''} onChange={(e) => setNewTask({...newTask, assignee_id: e.target.value ? parseInt(e.target.value) : null})}>
                  <option value="">Unassigned</option>
                  {[project.owner, ...project.members.filter(m => m.id !== project.owner_id)].filter(Boolean).map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4" style={{marginTop: '10px'}}>
              <button type="submit" className="btn-primary" style={{width: '150px'}}>Create Task</button>
              <button type="button" onClick={() => setShowTaskForm(false)} style={{background: 'transparent', color: 'var(--text-main)', fontWeight: '600'}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px'}}>
        {/* Task Columns or List */}
        <div className="flex flex-col gap-4">
          <h2 style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
            <Clock size={20} color="var(--primary)" /> Active Tasks
          </h2>
          {project.tasks.filter(t => t.status !== 'completed').map(task => (
            <Link key={task.id} to={`/projects/${id}/tasks/${task.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="glass-card" style={{cursor: 'pointer', transition: 'transform 0.15s'}} onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div className="flex justify-between items-start mb-3">
                <h3 style={{fontSize: '1rem', fontWeight: '700'}}>{task.title}</h3>
                <span className={`badge badge-${task.status.replace('_', '')}`}>{task.status.replace('_', ' ')}</span>
              </div>
              {task.description && <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px'}}>{task.description}</p>}
              <div className="flex justify-between items-center" style={{marginTop: '12px'}}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                  color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'
                }}>{task.priority}</span>
                <button onClick={(e) => { e.preventDefault(); updateStatus(task.id, task.status); }} className="btn-primary" style={{padding: '6px 14px', fontSize: '0.8rem', height: '32px'}}>
                  {task.status === 'todo' ? 'Start →' : 'Complete ✓'}
                </button>
              </div>
            </div>
            </Link>
          ))}
          {project.tasks.filter(t => t.status !== 'completed').length === 0 && (
            <p style={{color: 'var(--text-muted)', textAlign: 'center', padding: '40px', border: '1px dashed var(--border)', borderRadius: '12px'}}>No active tasks</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
            <CheckCircle2 size={20} color="var(--success)" /> Completed
          </h2>
          {project.tasks.filter(t => t.status === 'completed').map(task => (
            <Link key={task.id} to={`/projects/${id}/tasks/${task.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="glass-card" style={{opacity: 0.6, cursor: 'pointer'}}>
              <div className="flex justify-between items-start mb-3">
                <h3 style={{fontSize: '1rem', fontWeight: '700', textDecoration: 'line-through'}}>{task.title}</h3>
                <span className="badge badge-completed">Completed</span>
              </div>
              <button onClick={(e) => { e.preventDefault(); updateStatus(task.id, task.status); }} style={{background: 'transparent', color: 'var(--text-muted)', padding: '4px 0', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'underline'}}>
                Reopen
              </button>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
