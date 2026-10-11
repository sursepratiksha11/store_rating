import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CountUpModule from 'react-countup';
import { LayoutDashboard, Plus, Search, Store, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useFetch, useSort } from '../useFetch';
import { runChecks } from '../validators';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Stars from '../components/Stars';
import Page from '../components/Page';

const CountUp = CountUpModule.default ?? CountUpModule;

const ROLES = { ADMIN: 'Admin', NORMAL_USER: 'Normal user', STORE_OWNER: 'Store owner' };
const TABS = [['overview', 'Overview', LayoutDashboard], ['users', 'Users', Users], ['stores', 'Stores', Store]];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  return (
    <Page>
      <h1 className="title">Admin desk</h1>
      <div className="tabs">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>
            <Icon size={16} /> {label}
            {tab === id && <motion.span layoutId="tab-underline" className="underline" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'overview' && <Overview />}
          {tab === 'users' && <UsersTab />}
          {tab === 'stores' && <StoresTab />}
        </motion.div>
      </AnimatePresence>
    </Page>
  );
}

function Overview() {
  const { data } = useFetch('/admin/stats', {}, { users: 0, stores: 0, ratings: 0 });
  const cards = [['Total users', data.users, Users], ['Total stores', data.stores, Store], ['Ratings submitted', data.ratings, null]];
  return (
    <div className="stats">
      {cards.map(([label, n, Icon], i) => (
        <motion.div key={label} className={`stat ${i === 0 ? 'accent' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6, rotate: -1 }}>
          <span>{label}</span>
          <strong><CountUp end={n} duration={1.4} /></strong>
          {Icon ? <Icon size={20} /> : <Stars value={5} size={16} />}
        </motion.div>
      ))}
    </div>
  );
}

function Filter({ value, onChange, placeholder }) {
  return <div className="search"><Search size={16} /><input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function UsersTab() {
  const [q, setQ] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, toggle] = useSort('name');
  const { data, loading, reload } = useFetch('/admin/users', { ...q, ...sort });
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState(null);
  const up = (k) => (v) => setQ({ ...q, [k]: v });

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (r) => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <span className={`chip ${r.role}`}>{ROLES[r.role]}</span> },
  ];

  return (
    <>
      <div className="filters">
        <Filter placeholder="Name" value={q.name} onChange={up('name')} />
        <Filter placeholder="Email" value={q.email} onChange={up('email')} />
        <Filter placeholder="Address" value={q.address} onChange={up('address')} />
        <select value={q.role} onChange={(e) => up('role')(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn small" onClick={() => setAdding(true)}><Plus size={16} /> Add user</button>
      </div>
      <DataTable columns={columns} rows={data} sort={sort} onSort={toggle} loading={loading} onRowClick={(r) => api.get(`/admin/users/${r.id}`).then((x) => setDetail(x.data))} />
      <AnimatePresence>
        {adding && <AddUser onClose={() => setAdding(false)} onDone={() => { setAdding(false); reload(); }} />}
        {detail && (
          <Modal title="User details" onClose={() => setDetail(null)}>
            <dl className="detail">
              <dt>Name</dt><dd>{detail.name}</dd>
              <dt>Email</dt><dd>{detail.email}</dd>
              <dt>Address</dt><dd>{detail.address}</dd>
              <dt>Role</dt><dd>{ROLES[detail.role]}</dd>
              {detail.role === 'STORE_OWNER' && <><dt>Rating</dt><dd>{detail.rating ? <><Stars value={Number(detail.rating)} size={16} /> {detail.rating}</> : 'No ratings yet'}</dd></>}
            </dl>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function AddUser({ onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const errs = runChecks(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try { await api.post('/admin/users', form); toast.success('User added'); onDone(); }
    catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <Modal title="Add user" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Address" textarea rows={2} value={form.address} onChange={set('address')} error={errors.address} />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} />
        <Field label="Role"><select value={form.role} onChange={set('role')}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <button className="btn">Create user</button>
      </form>
    </Modal>
  );
}

function StoresTab() {
  const [q, setQ] = useState({ name: '', email: '', address: '' });
  const [sort, toggle] = useSort('name');
  const { data, loading, reload } = useFetch('/admin/stores', { ...q, ...sort });
  const [adding, setAdding] = useState(false);
  const up = (k) => (v) => setQ({ ...q, [k]: v });

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (r) => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => <span className="score">{Number(r.rating).toFixed(1)} <Stars value={Number(r.rating)} size={14} /></span> },
  ];

  return (
    <>
      <div className="filters">
        <Filter placeholder="Name" value={q.name} onChange={up('name')} />
        <Filter placeholder="Email" value={q.email} onChange={up('email')} />
        <Filter placeholder="Address" value={q.address} onChange={up('address')} />
        <button className="btn small" onClick={() => setAdding(true)}><Plus size={16} /> Add store</button>
      </div>
      <DataTable columns={columns} rows={data} sort={sort} onSort={toggle} loading={loading} />
      <AnimatePresence>{adding && <AddStore onClose={() => setAdding(false)} onDone={() => { setAdding(false); reload(); }} />}</AnimatePresence>
    </>
  );
}

function AddStore({ onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const { data: owners } = useFetch('/admin/users', { role: 'STORE_OWNER' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const errs = runChecks(form, ['name', 'email', 'address']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try { await api.post('/admin/stores', form); toast.success('Store added'); onDone(); }
    catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <Modal title="Add store" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Store name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Store email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Address" textarea rows={2} value={form.address} onChange={set('address')} error={errors.address} />
        <Field label="Owner (optional)"><select value={form.ownerId} onChange={set('ownerId')}><option value="">— none —</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
        <button className="btn">Create store</button>
      </form>
    </Modal>
  );
}
