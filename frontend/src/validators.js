// mirrors the backend rules so users get instant feedback
export const check = {
  name: (v) => (v.trim().length < 10 || v.trim().length > 60 ? 'Name must be 10–60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address'),
  address: (v) => (!v.trim() ? 'Address is required' : v.length > 400 ? 'Max 400 characters' : ''),
  password: (v) =>
    v.length < 8 || v.length > 16
      ? 'Password must be 8–16 characters'
      : !/[A-Z]/.test(v)
      ? 'Add at least one uppercase letter'
      : !/[^A-Za-z0-9]/.test(v)
      ? 'Add at least one special character'
      : '',
};

export const runChecks = (values, fields) =>
  fields.reduce((errs, f) => {
    const msg = check[f]?.(values[f] || '');
    return msg ? { ...errs, [f]: msg } : errs;
  }, {});
