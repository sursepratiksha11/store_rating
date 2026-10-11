import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth, homeFor } from '../AuthContext';
import Field from '../components/Field';
import AuthShell from './AuthShell';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      signIn(data);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      nav(homeFor(data.user.role));
    } catch (err) { toast.error(errMsg(err)); }
    setBusy(false);
  };

  return (
    <AuthShell title="Log in" sub="One login for shoppers, store owners and admins.">
      <form onSubmit={submit}>
        <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} required />
        <button className="btn" disabled={busy}>{busy ? 'Checking…' : 'Log in'}</button>
      </form>
      <p className="alt">New here? <Link to="/signup">Create an account</Link></p>
    </AuthShell>
  );
}
