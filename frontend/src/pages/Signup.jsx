import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../App';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authApi.signup(formData);
      login(data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{flex: 1, padding: '8vh 20vw'}}>
      <div className="glass-card w-full max-w-md animate-fade">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div style={{background: 'var(--primary)', padding: '12px', borderRadius: '12px', marginBottom: '10px'}}>
            <UserPlus color="white" size={32} />
          </div>
          <h1 style={{fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.025em'}}>Create Account</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Join the team today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600'}}>FULL NAME</label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600'}}>EMAIL</label>
            <input 
              type="email" 
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600'}}>PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600'}}>ROLE</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {error && <p style={{color: 'var(--danger)', fontSize: '0.875rem'}}>{error}</p>}
          
          <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>
            Sign Up
          </button>
        </form>
        
        <p style={{marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary)', textDecoration: 'none'}}>Login</Link>
        </p>
      </div>
    </div>
  );
}
