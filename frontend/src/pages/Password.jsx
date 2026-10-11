import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { check } from '../validators';
import Field from '../components/Field';
import Page from '../components/Page';

export default function Password() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const msg = check.password(form.newPassword);
    setError(msg);
    if (msg) return;
    try {
      await api.put('/auth/password', form);
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <Page className="narrow">
      <h1 className="title">Change password</h1>
      <form className="card" onSubmit={submit} noValidate>
        <Field label="Current password" type="password" value={form.currentPassword} onChange={set('currentPassword')} />
        <Field label="New password" type="password" value={form.newPassword} onChange={set('newPassword')} error={error} />
        <p className="hint">8–16 characters, one uppercase letter and one special character.</p>
        <button className="btn">Update password</button>
      </form>
    </Page>
  );
}
