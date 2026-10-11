import CountUp from 'react-countup';
import { Users } from 'lucide-react';
import { useFetch, useSort } from '../useFetch';
import DataTable from '../components/DataTable';
import Stars from '../components/Stars';
import Page from '../components/Page';

export default function OwnerDashboard() {
  const [sort, toggle] = useSort('date');
  const { data, loading } = useFetch('/owner/dashboard', sort, { store: null, raters: [] });
  const { store, raters } = data;

  const columns = [
    { key: 'name', label: 'User', sortable: true, render: (r) => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => <Stars value={r.rating} size={16} /> },
    { key: 'date', label: 'When', sortable: true, render: (r) => new Date(r.date).toLocaleDateString() },
  ];

  if (!loading && !store)
    return <Page><h1 className="title">No store linked yet</h1><p className="sub">Ask an administrator to assign a store to your account.</p></Page>;

  return (
    <Page>
      <h1 className="title">{store?.name || 'Your store'}</h1>
      <p className="sub">{store?.address}</p>
      <div className="stats two">
        <div className="stat accent">
          <span>Average rating</span>
          <strong><CountUp end={Number(store?.average_rating || 0)} decimals={1} duration={1.2} /><small> / 5</small></strong>
          <Stars value={Number(store?.average_rating || 0)} size={18} />
        </div>
        <div className="stat"><span>Total ratings</span><strong><CountUp end={store?.total_ratings || 0} duration={1.2} /></strong><Users size={18} /></div>
      </div>
      <h2 className="sec">Who rated you</h2>
      <DataTable columns={columns} rows={raters} sort={sort} onSort={toggle} loading={loading} empty="No ratings yet — hang tight!" />
    </Page>
  );
}
