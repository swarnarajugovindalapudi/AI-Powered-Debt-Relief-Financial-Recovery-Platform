function AuthField({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  helperText,
  leftIcon,
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-200">{label}</span>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            {leftIcon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 ${
            leftIcon ? "pl-11" : ""
          } ${error ? "border-rose-400/80" : "border-slate-800"}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? `${name}-help` : undefined}
        />
      </div>

      {error ? (
        <p id={`${name}-help`} className="text-sm text-rose-300">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${name}-help`} className="text-sm text-slate-400">
          {helperText}
        </p>
      ) : null}
    </label>
  );
}

export default AuthField;