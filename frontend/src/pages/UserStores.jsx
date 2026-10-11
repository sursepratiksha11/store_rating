import { useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useFetch, useSort } from '../useFetch';
import DataTable from '../components/DataTable';
import Stars from '../components/Stars';
import Page from '../components/Page';

export default function UserStores() {
  const [q, setQ] = useState({ name: '', address: '' });
  const [sort, toggle] = useSort('name');
  const { data, loading, reload } = useFetch('/stores', { ...q, ...sort });

  const rate = async (store, rating) => {
    try {
      await api.put(`/stores/${store.id}/rating`, { rating });
      toast.success(store.my_rating ? 'Rating updated' : 'Thanks for rating!');
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const columns = [
    { key: 'name', label: 'Store', sortable: true, render: (r) => <strong>{r.name}</strong> },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall', sortable: true, render: (r) => <span className="score">{Number(r.overall_rating).toFixed(1)} <small>({r.total_ratings})</small></span> },
    { key: 'mine', label: 'Your rating', sortable: true, render: (r) => r.my_rating ? <b>{r.my_rating} / 5</b> : <span className="dim">Not rated</span> },
    { key: 'act', label: 'Rate / modify', render: (r) => <Stars value={r.my_rating || 0} onChange={(n) => rate(r, n)} /> },
  ];

  return (
    <Page>
      <h1 className="title">Find a store, leave a rating</h1>
      <div className="filters">
        <div className="search"><Search size={16} /><input placeholder="Search by name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} /></div>
        <div className="search"><Search size={16} /><input placeholder="Search by address" value={q.address} onChange={(e) => setQ({ ...q, address: e.target.value })} /></div>
      </div>
      <DataTable columns={columns} rows={data} sort={sort} onSort={toggle} loading={loading} empty="No stores match your search" />
    </Page>
  );
}
