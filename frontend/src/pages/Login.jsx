import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import AuthField from "../components/auth/AuthField";
import { getAuthToken, signIn } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validationErrors = useMemo(() => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Gmail address is required.";
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid Gmail address like name@gmail.com.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  }, [email, password]);

  useEffect(() => {
    if (getAuthToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const showFieldError = (name) => touched[name] || submitError;

  const handleBlur = (name) => {
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setTouched({ email: true, password: true });
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await signIn({ email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(error?.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-8 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/80 shadow-glow backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.12),_transparent_30%)]" />

          <div className="relative grid min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
            <section className="hidden flex-col justify-between border-r border-slate-800/80 p-10 lg:flex">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                  <ShieldCheck size={16} />
                  Secure borrower workspace
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                    <Sparkles size={14} />
                    FinRelief AI
                  </div>
                  <h1 className="max-w-md text-4xl font-black tracking-tight text-white xl:text-5xl">
                    A fintech login built for recovery workflows.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-slate-300">
                    Sign in to access a protected debt relief workspace with live analysis, settlement planning,
                    and negotiation tools.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <Mail size={16} className="text-cyan-300" />
                  Gmail-only validation protects the sign-in entry point.
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <Lock size={16} className="text-cyan-300" />
                  Token-based access keeps protected routes working without breaking architecture.
                </div>
              </div>
            </section>

            <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
              <form className="w-full max-w-md space-y-6 rounded-[1.75rem] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/40 sm:p-8" onSubmit={handleLogin} noValidate>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    <ShieldCheck size={14} />
                    FinRelief AI
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white">Sign in</h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Enter your Gmail address and password to open the protected dashboard.
                  </p>
                </div>

                {submitError ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
                    {submitError}
                  </div>
                ) : null}

                <div className="space-y-4">
                  <AuthField
                    label="Gmail address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="name@gmail.com"
                    autoComplete="email"
                    error={showFieldError("email") ? validationErrors.email : ""}
                    helperText="Only Gmail addresses are accepted."
                    leftIcon={<Mail size={16} />}
                  />

                  <AuthField
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Minimum 8 characters"
                    autoComplete="current-password"
                    error={showFieldError("password") ? validationErrors.password : ""}
                    helperText="Use at least 8 characters."
                    leftIcon={<Lock size={16} />}
                  />
                </div>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Signing in..." : "Login"}
                  {!loading ? <ArrowRight size={16} /> : null}
                </button>

                <p className="text-center text-sm leading-6 text-slate-500">
                  Demo authentication is used automatically only when the backend login endpoint is unavailable.
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;