import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function DataTable({ columns, rows, sort, onSort, loading, onRowClick, empty = 'Nothing here yet' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.sortable ? 'sortable' : ''} onClick={() => c.sortable && onSort(c.key)}>
                {c.label}
                {c.sortable && (sort.sort === c.key ? (sort.order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ChevronsUpDown size={14} className="dim" />)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.3) }} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick?.(r)}
              >
                {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      {loading && <div className="bar" />}
      {!loading && !rows.length && <p className="empty">{empty}</p>}
    </div>
  );
}
