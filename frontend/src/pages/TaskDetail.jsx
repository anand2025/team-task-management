import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskApi, projectApi } from '../api';
import { useAuth } from '../App';
import { ChevronLeft, Clock, CheckCircle2, User, Calendar, Flag, Check } from 'lucide-react';

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

const PRIORITY_CONFIG = {
  low: { color: '#10b981', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high: { color: '#ef4444', label: 'High' },
};

export default function TaskDetail() {
  const { taskId, projectId } = useParams();
  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [savedField, setSavedField] = useState(null); // shows tick feedback
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadTask();
    loadProjectMembers();
  }, [taskId, projectId]);

  const loadTask = async () => {
    try {
      const { data } = await taskApi.getById(taskId);
      setTask(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectMembers = async () => {
    try {
      const { data } = await projectApi.list();
      const project = data.find(p => p.id === parseInt(projectId));
      if (project) {
        // Combine owner + members, deduplicated
        const all = [project.owner, ...project.members].filter(Boolean);
        const unique = all.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
        setProjectMembers(unique);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateField = async (field, value) => {
    try {
      const { data } = await taskApi.update(taskId, { [field]: value || null });
      setTask(data);
      setSavedField(field);
      setTimeout(() => setSavedField(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const cycleStatus = async () => {
    const statuses = ['todo', 'in_progress', 'completed'];
    const nextStatus = statuses[(statuses.indexOf(task.status) + 1) % 3];
    setUpdating(true);
    try {
      const { data } = await taskApi.update(taskId, { status: nextStatus });
      setTask(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!task) return (
    <div className="flex items-center justify-center w-full" style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading task...</p>
    </div>
  );

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const createdAt = new Date(task.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Format due_date for display and for the date input (YYYY-MM-DD)
  const dueDateValue = task.due_date ? task.due_date.split('T')[0] : '';
  const dueDateDisplay = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const assignee = projectMembers.find(m => m.id === task.assignee_id);

  return (
    <div className="container animate-fade" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '800px' }}>
      <Link
        to={`/projects/${projectId}`}
        className="flex items-center gap-1 mb-8"
        style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}
      >
        <ChevronLeft size={18} /> Back to Project
      </Link>

      {/* Header Card */}
      <div className="glass-card mb-6">
        <div className="flex justify-between items-start mb-6">
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{task.title}</h1>
          <span style={{
            padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700',
            background: statusCfg.bg, color: statusCfg.color, whiteSpace: 'nowrap', marginLeft: '16px'
          }}>
            {statusCfg.label}
          </span>
        </div>

        {task.description
          ? <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '24px' }}>{task.description}</p>
          : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>No description provided.</p>
        }

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          
          {/* Priority — read-only display */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Flag size={12} /> Priority
            </p>
            <p style={{ fontWeight: '700', color: priorityCfg.color }}>{priorityCfg.label}</p>
          </div>

          {/* Created — always read-only */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} /> Created
            </p>
            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{createdAt}</p>
          </div>

          {/* Due Date — editable for admin */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} /> Due Date
              {savedField === 'due_date' && <Check size={13} color="var(--success)" />}
            </p>
            {isAdmin ? (
              <input
                type="date"
                value={dueDateValue}
                onChange={(e) => updateField('due_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)',
                  borderRadius: 0, padding: '4px 0', fontSize: '0.9rem', fontWeight: '600',
                  color: isOverdue ? 'var(--danger)' : 'var(--text-main)', width: '100%', cursor: 'pointer'
                }}
              />
            ) : (
              <p style={{ fontWeight: '600', fontSize: '0.9rem', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                {dueDateDisplay || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}
                {isOverdue && ' ⚠'}
              </p>
            )}
          </div>

          {/* Assigned To — editable for admin */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={12} /> Assigned To
              {savedField === 'assignee_id' && <Check size={13} color="var(--success)" />}
            </p>
            {isAdmin ? (
              <select
                value={task.assignee_id || ''}
                onChange={(e) => updateField('assignee_id', e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)',
                  borderRadius: 0, padding: '4px 0', fontSize: '0.9rem', fontWeight: '600',
                  color: 'var(--text-main)', width: '100%', cursor: 'pointer'
                }}
              >
                <option value="">Unassigned</option>
                {projectMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            ) : (
              <p style={{ fontWeight: '600', fontSize: '0.9rem', color: assignee ? 'inherit' : 'var(--text-muted)' }}>
                {assignee ? assignee.full_name : <span style={{ fontStyle: 'italic' }}>Unassigned</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Action */}
      {task.status !== 'completed' ? (
        <button
          onClick={cycleStatus}
          disabled={updating}
          className="btn-primary"
          style={{ width: '100%', height: '52px', fontSize: '1rem', borderRadius: '10px', opacity: updating ? 0.7 : 1 }}
        >
          {updating ? 'Updating...' : task.status === 'todo' ? 'Mark as In Progress →' : 'Mark as Completed ✓'}
        </button>
      ) : (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
          <CheckCircle2 size={24} color="var(--success)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontWeight: '700', color: 'var(--success)' }}>Task Completed</p>
          <button onClick={cycleStatus} style={{ marginTop: '12px', background: 'transparent', color: 'var(--text-muted)', fontWeight: '600', textDecoration: 'underline', fontSize: '0.85rem' }}>
            Reopen task
          </button>
        </div>
      )}
    </div>
  );
}
