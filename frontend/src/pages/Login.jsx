import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../App';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authApi.login({ email, password, full_name: '', role: 'member' });
      login(data.access_token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{flex: 1, padding: '8vh 20vw'}}>
      <div className="glass-card w-full max-w-md animate-fade">
        <div className="flex items-center gap-2 mb-12">
          <div style={{width: '32px', height: '24px', background: 'var(--primary)', clipPath: 'polygon(0% 0%, 100% 0%, 70% 100%, 0% 100%)'}}></div>
          <span style={{fontWeight: '700', fontSize: '1.1rem'}}>Taskoo</span>
        </div>
        
        <div className="mb-10">
          <h1 style={{fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '8px'}}>Welcome back, Login.</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label style={{color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500'}}>Email</label>
            <input 
              type="email" 
              placeholder="ken@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={{color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500'}}>Password</label>
            <input 
              type="password" 
              placeholder="kenspassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p style={{color: 'var(--danger)', fontSize: '0.875rem'}}>{error}</p>}
          
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" style={{marginTop: '10px', height: '50px', fontSize: '1rem', borderRadius: '8px'}}>
            Login <span style={{fontSize: '1.2rem'}}>→</span>
          </button>
        </form>
        
        <p style={{marginTop: '24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          Don't have an account? <Link to="/signup" style={{color: 'var(--text-main)', fontWeight: '600', textDecoration: 'underline'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
