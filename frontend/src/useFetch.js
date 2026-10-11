import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from './api';

// debounced GET: re-runs whenever url/params change
export function useFetch(url, params = {}, fallback = []) {
  const key = JSON.stringify(params);
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      api.get(url, { params: JSON.parse(key) })
        .then((r) => alive && setData(r.data))
        .catch((e) => toast.error(errMsg(e)))
        .finally(() => alive && setLoading(false));
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [url, key, tick]);

  return { data, loading, reload: () => setTick((n) => n + 1) };
}

export function useSort(initial = 'name') {
  const [sort, setSort] = useState({ sort: initial, order: 'asc' });
  const toggle = (key) =>
    setSort((s) => ({ sort: key, order: s.sort === key && s.order === 'asc' ? 'desc' : 'asc' }));
  return [sort, toggle];
}
