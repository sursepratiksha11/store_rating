import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth, homeFor } from '../AuthContext';
import { runChecks } from '../validators';
import Field from '../components/Field';
import AuthShell from './AuthShell';

const FIELDS = ['name', 'email', 'address', 'password'];

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = runChecks(form, FIELDS);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      signIn(data);
      toast.success('Account created!');
      nav(homeFor(data.user.role));
    } catch (err) { toast.error(errMsg(err)); }
    setBusy(false);
  };

  return (
    <AuthShell title="Join Shelfie" sub="Sign up as a shopper and start rating.">
      <form onSubmit={submit} noValidate>
        <Field label="Full name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Address" textarea rows={2} value={form.address} onChange={set('address')} error={errors.address} />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} />
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="alt">Already registered? <Link to="/login">Log in</Link></p>
    </AuthShell>
  );
}
