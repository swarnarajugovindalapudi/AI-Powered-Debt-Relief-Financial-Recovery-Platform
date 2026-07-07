import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const variantConfig = {
  error: {
    icon: AlertTriangle,
    titleColor: "status-message__title--error",
  },
  success: {
    icon: CheckCircle2,
    titleColor: "status-message__title--success",
  },
  info: {
    icon: Info,
    titleColor: "status-message__title--info",
  },
};

function StatusMessage({
  variant = "info",
  title,
  message,
  children,
  actions,
  className = "",
}) {
  const config = variantConfig[variant] ?? variantConfig.info;
  const Icon = config.icon;

  return (
    <div className={`status-message status-message--${variant} ${className}`.trim()} role="status" aria-live="polite">
      <div className="status-message__icon">
        <Icon size={18} />
      </div>

      <div className="status-message__content">
        {title ? <div className={`status-message__title ${config.titleColor}`}>{title}</div> : null}
        {message ? <p className="status-message__text">{message}</p> : null}
        {children}
      </div>

      {actions ? <div className="status-message__actions">{actions}</div> : null}
    </div>
  );
}

export default StatusMessage;