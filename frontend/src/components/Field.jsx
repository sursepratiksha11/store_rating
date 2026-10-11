export default function Field({ label, error, textarea, children, ...props }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children || <Tag {...props} />}
      {error && <small>{error}</small>}
    </label>
  );
}
