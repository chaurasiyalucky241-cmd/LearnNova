import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Landmark,
  LineChart,
  Lightbulb,
  Lock,
  Mail,
  Presentation,
  Settings,
  TriangleAlert,
  User,
} from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

const THEMES = [
  { id: "midnight", label: "Midnight" },
  { id: "aurora", label: "Aurora" },
  { id: "sunrise", label: "Sunrise" },
  { id: "graphite", label: "Graphite" },
];

const ROLES = [
  { label: "STUDENT", icon: User },
  { label: "FACULTY", icon: Presentation },
  { label: "ADMIN", icon: Settings },
];

function GoogleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.5 19.3a14.5 14.5 0 0 0 0 9.4l-7.9 6.1a24 24 0 0 1 0-21.6l7.9 6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.6-2 15.5-5.6l-7.4-5.7c-2.1 1.4-4.8 2.2-8.1 2.2-6.3 0-11.6-3.6-13.5-8.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F35325" />
      <rect x="12" y="1" width="10" height="10" fill="#81BC06" />
      <rect x="1" y="12" width="10" height="10" fill="#05A6F0" />
      <rect x="12" y="12" width="10" height="10" fill="#FFBA08" />
    </svg>
  );
}

function ThemePicker({ theme, setTheme }) {
  return (
    <div className="theme-switcher" role="group" aria-label="Theme options">
      <span className="theme-switcher-label">Theme</span>
      <div className="theme-switcher-list">
        {THEMES.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`theme-chip${theme === option.id ? " active" : ""}`}
            aria-pressed={theme === option.id}
            onClick={() => setTheme(option.id)}
          >
            <span className="theme-swatch" data-theme={option.id} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RoleTabs({ roleIndex, setRoleIndex }) {
  return (
    <div className="role-tabs">
      <div
        className="tab-indicator"
        style={{ transform: `translateX(${roleIndex * 100}%)` }}
      />
      {ROLES.map((role, index) => {
        const Icon = role.icon;
        const active = index === roleIndex;

        return (
          <button
            key={role.label}
            type="button"
            className={`tab-btn${active ? " active" : ""}`}
            onClick={() => setRoleIndex(index)}
          >
            <Icon size={15} className="tab-icon" />
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

function AuthForm({ view, roleIndex, setRoleIndex, setView, onLogin }) {
  return view === "login" ? (
    <div className="login-card view-fade" key="login">
      <h2>Log in to your success</h2>

      <RoleTabs roleIndex={roleIndex} setRoleIndex={setRoleIndex} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onLogin?.({
            name: formData.get("name") || formData.get("email")?.split("@")[0] || "User",
            email: formData.get("email"),
          });
        }}
      >
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <div className="input-wrapper">
            <Mail size={14} />
            <input name="email" type="email" id="email" placeholder="you@institution.edu" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock size={14} />
            <input type="password" id="password" placeholder="••••••••" required />
          </div>
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </div>

        <button type="submit" className="btn-submit">
          Sign in
        </button>
      </form>

      <div className="divider">
        <span>Or continue with</span>
      </div>

      <div className="social-logins">
        <button type="button" className="social-btn">
          <GoogleMark />
          <span>Google</span>
        </button>
        <button type="button" className="social-btn">
          <MicrosoftMark />
          <span>Microsoft</span>
        </button>
        <button type="button" className="social-btn">
          <Landmark size={15} style={{ color: "var(--cyan)" }} />
          <span>Institution</span>
        </button>
      </div>

      <button type="button" className="btn-secondary" onClick={() => setView("signup")}>
        Create your account
      </button>

      <div className="signup-text signup-link-row">
        New here?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("signup");
          }}
        >
          Ask your institution for access.
        </a>
      </div>
    </div>
  ) : (
    <div className="login-card view-fade" key="signup">
      <button type="button" className="btn-back" onClick={() => setView("login")}>
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <h2>Create your account</h2>

      <RoleTabs roleIndex={roleIndex} setRoleIndex={setRoleIndex} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onLogin?.({
            name: formData.get("name"),
            email: formData.get("email"),
          });
        }}
      >
        <div className="form-group">
          <label htmlFor="reg-name">Full name</label>
          <div className="input-wrapper">
            <User size={14} />
            <input name="name" type="text" id="reg-name" placeholder="Jane Doe" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Institutional email</label>
          <div className="input-wrapper">
            <Mail size={14} />
            <input name="email" type="email" id="reg-email" placeholder="you@institution.edu" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <div className="input-wrapper">
            <Lock size={14} />
            <input
              type="password"
              id="reg-password"
              placeholder="Create a strong password"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-submit">
          Register account
        </button>
      </form>

      <div className="divider">
        <span>Or register with</span>
      </div>

      <div className="social-logins">
        <button type="button" className="social-btn">
          <GoogleMark />
          <span>Google</span>
        </button>
        <button type="button" className="social-btn">
          <MicrosoftMark />
          <span>Microsoft</span>
        </button>
        <button type="button" className="social-btn">
          <Landmark size={15} style={{ color: "var(--cyan)" }} />
          <span>Institution</span>
        </button>
      </div>

      <div className="signup-text">
        Already have an account?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("login");
          }}
        >
          Sign in here
        </a>
      </div>
    </div>
  );
}

function HeroContent({ view }) {
  return view === "login" ? (
    <div className="hero-text hero-stage">
      <span className="hero-kicker">AI guided student support</span>
      <h1>
        Reading the <em>signals</em>
        <br />
        before the report card.
      </h1>
      <p>
        Attendance dips, missed check-ins, and sliding grades are easier to spot when the
        data works together. Learnova connects the dots across every course and
        flags the moment a student needs support.
      </p>

      <ul className="feature-list">
        <li>
          <span className="feat-icon">
            <TriangleAlert size={12} />
          </span>
          Identify at-risk students early
        </li>
        <li>
          <span className="feat-icon">
            <LineChart size={12} />
          </span>
          Gain insight into academic performance
        </li>
        <li>
          <span className="feat-icon">
            <Lightbulb size={12} />
          </span>
          Access data-driven recommendations
        </li>
      </ul>
    </div>
  ) : (
    <div className="hero-text hero-stage">
      <span className="hero-kicker">Join a proactive learning network</span>
      <h1>
        Empower your <em>academic</em>
        <br />
        journey today.
      </h1>
      <p>
        Join students, faculty, and administrators who rely on AI-driven insights to
        prevent academic drop-off and foster long-term success.
      </p>

      <ul className="feature-list">
        <li>
          <span className="feat-icon">
            <CheckCircle2 size={12} />
          </span>
          Seamless institutional SSO integration
        </li>
        <li>
          <span className="feat-icon">
            <CheckCircle2 size={12} />
          </span>
          Real-time automated risk alerts
        </li>
        <li>
          <span className="feat-icon">
            <CheckCircle2 size={12} />
          </span>
          FERPA and HIPAA aligned data privacy
        </li>
      </ul>
    </div>
  );
}

export default function AuthContainer({ theme, setTheme, onLogin }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [view, setView] = useState("login");

  const { nodes, lines } = useMemo(() => {
    const width = 1000;
    const height = 700;
    const count = 26;
    const seeded = (index, salt) => {
      const value = Math.sin(index * 97.97 + salt * 17.17) * 43758.5453;
      return value - Math.floor(value);
    };

    const points = Array.from({ length: count }, () => ({
      x: 0,
      y: 0,
    })).map((point, index) => ({
      x: seeded(index, 1) * width,
      y: seeded(index, 2) * height,
    }));

    const connections = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) {
          connections.push({
            x1: points[i].x,
            y1: points[i].y,
            x2: points[j].x,
            y2: points[j].y,
          });
        }
      }
    }

    const signalIndexes = new Set([
      Math.floor(seeded(0, 3) * points.length),
      Math.floor(seeded(1, 3) * points.length),
      Math.floor(seeded(2, 3) * points.length),
    ]);

    return {
      nodes: points.map((point, index) => ({
        ...point,
        signal: signalIndexes.has(index),
        alt: signalIndexes.has(index) && index % 2 !== 0,
      })),
      lines: connections,
    };
  }, []);

  return (
    <div className="ssai-root" data-theme={theme} data-view={view}>
      <style>{css}</style>

      <div className="background-orbs" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <svg
        className="constellation"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {lines.map((line, index) => (
          <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
        {nodes.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={node.signal ? 4 : 2.2}
            className={node.signal ? `signal${node.alt ? " alt" : ""}` : "node"}
          />
        ))}
      </svg>

      <div className="container">
        <section className="left-panel">
          <nav className="top-nav" aria-label="Primary">
            <div className="logo-area">
              <div className="logo-icon">
                <BrandLogo state="signedOut" />
              </div>
              <div>
                <div className="brand-title">Learn<span>ova</span></div>
                <div className="brand-subtitle">Your AI-powered student success companion</div>
              </div>
            </div>

            <ThemePicker theme={theme} setTheme={setTheme} />
          </nav>

          <HeroContent view={view} />

          <div className="insight-strip">
            <div>
              <strong>4x</strong>
              <span>faster intervention alerts</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>signal monitoring</span>
            </div>
            <div>
              <strong>4</strong>
              <span>adaptive themes</span>
            </div>
          </div>
        </section>

        <section className="right-panel">
          <AuthForm
            view={view}
            roleIndex={roleIndex}
            setRoleIndex={setRoleIndex}
            setView={setView}
            onLogin={onLogin}
          />

          <div className="page-footer">
            <span>(c) 2026 Learnova</span>
            <a href="#">Support</a>
          </div>
        </section>
      </div>
    </div>
  );
}

const css = `
html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: #0a0118;
}

body {
  overflow: hidden;
}

.ssai-root {
  --bg1: #0a0118;
  --bg2: #1e1145;
  --bg3: #2e0854;
  --bg4: #4c1d95;
  --bg5: #0093e9;
  --ink: #f8fafc;
  --ink-soft: #c7c2e0;
  --ink-faint: #8781a8;
  --violet: #8a2be2;
  --cyan: #00d4ff;
  --glass-bg: rgba(255, 255, 255, 0.055);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-strong: rgba(255, 255, 255, 0.09);
  --node: rgba(255, 255, 255, 0.55);
  --orb-a: rgba(0, 212, 255, 0.22);
  --orb-b: rgba(138, 43, 226, 0.2);
  --orb-c: rgba(255, 255, 255, 0.1);

  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(150deg, var(--bg1) 0%, var(--bg2) 32%, var(--bg3) 58%, var(--bg4) 80%, var(--bg5) 100%);
  background-size: 180% 180%;
  animation: drift 22s ease-in-out infinite;
  color: var(--ink);
  transition: background 0.9s ease, color 0.45s ease;
  box-sizing: border-box;
}

.ssai-root[data-theme="aurora"] {
  --bg1: #05151c;
  --bg2: #0d2742;
  --bg3: #15436a;
  --bg4: #4f2d7f;
  --bg5: #11c5c6;
  --violet: #8b5cf6;
  --cyan: #22d3ee;
  --glass-bg: rgba(5, 21, 28, 0.44);
  --glass-border: rgba(34, 211, 238, 0.18);
  --glass-strong: rgba(255, 255, 255, 0.08);
  --node: rgba(173, 243, 255, 0.45);
  --orb-a: rgba(34, 211, 238, 0.22);
  --orb-b: rgba(139, 92, 246, 0.22);
  --orb-c: rgba(255, 255, 255, 0.08);
}

.ssai-root[data-theme="sunrise"] {
  --bg1: #fff5eb;
  --bg2: #ffe1c9;
  --bg3: #ffc7a6;
  --bg4: #ffa86e;
  --bg5: #ff7b7b;
  --ink: #3e1734;
  --ink-soft: #6e465f;
  --ink-faint: #8f6c7d;
  --violet: #ef4444;
  --cyan: #f97316;
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(62, 23, 52, 0.12);
  --glass-strong: rgba(255, 255, 255, 0.72);
  --node: rgba(126, 64, 89, 0.32);
  --orb-a: rgba(249, 115, 22, 0.22);
  --orb-b: rgba(239, 68, 68, 0.18);
  --orb-c: rgba(255, 255, 255, 0.3);
}

.ssai-root[data-theme="graphite"] {
  --bg1: #0a0c10;
  --bg2: #111827;
  --bg3: #1f2937;
  --bg4: #334155;
  --bg5: #64748b;
  --ink: #f4f7fb;
  --ink-soft: #c5cfde;
  --ink-faint: #92a0b3;
  --violet: #94a3b8;
  --cyan: #38bdf8;
  --glass-bg: rgba(17, 24, 39, 0.54);
  --glass-border: rgba(148, 163, 184, 0.16);
  --glass-strong: rgba(255, 255, 255, 0.08);
  --node: rgba(203, 213, 225, 0.42);
  --orb-a: rgba(56, 189, 248, 0.18);
  --orb-b: rgba(148, 163, 184, 0.16);
  --orb-c: rgba(255, 255, 255, 0.08);
}

.ssai-root *,
.ssai-root *::before,
.ssai-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  transition:
    background-color 0.45s ease,
    border-color 0.45s ease,
    color 0.45s ease,
    box-shadow 0.45s ease,
    fill 0.45s ease,
    stroke 0.45s ease,
    transform 0.35s ease;
}

.ssai-root h1,
.ssai-root h2 {
  font-family: "Space Grotesk", Inter, sans-serif;
}

@keyframes drift {
  0%, 100% { background-position: 0% 30%; }
  50% { background-position: 100% 70%; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gentleFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -10px, 0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.55; r: 3.2; }
  50% { opacity: 1; r: 5.5; }
}

@keyframes glowShift {
  0%, 100% { filter: blur(40px) saturate(0.95); }
  50% { filter: blur(56px) saturate(1.08); }
}

.background-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(24px);
  opacity: 0.7;
  animation: gentleFloat 14s ease-in-out infinite, glowShift 16s ease-in-out infinite;
}

.orb-a {
  width: 24vw;
  height: 24vw;
  left: -6vw;
  top: 5vh;
  background: var(--orb-a);
}

.orb-b {
  width: 28vw;
  height: 28vw;
  right: -8vw;
  bottom: 4vh;
  background: var(--orb-b);
  animation-delay: -4s, -4s;
}

.orb-c {
  width: 18vw;
  height: 18vw;
  left: 36vw;
  bottom: -6vw;
  background: var(--orb-c);
  animation-delay: -8s, -8s;
}

.constellation {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}

.constellation line {
  stroke: var(--node);
  stroke-width: 1;
  opacity: 0.35;
}

.constellation circle.node {
  fill: var(--node);
}

.constellation circle.signal {
  fill: var(--cyan);
  animation: pulse 2.8s ease-in-out infinite;
}

.constellation circle.signal.alt {
  fill: var(--violet);
  animation-delay: 1.1s;
}

.theme-switcher {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 18px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s both;
}

.top-nav {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.theme-switcher-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.theme-switcher-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 100%;
}

.theme-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.theme-chip:hover {
  border-color: var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.theme-chip.active {
  border-color: var(--glass-border);
  background: var(--glass-bg);
  color: var(--ink);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

.theme-swatch {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.12);
}

.theme-swatch[data-theme="midnight"] {
  background: linear-gradient(135deg, #8a2be2, #00d4ff);
}

.theme-swatch[data-theme="aurora"] {
  background: linear-gradient(135deg, #22d3ee, #8b5cf6);
}

.theme-swatch[data-theme="sunrise"] {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.theme-swatch[data-theme="graphite"] {
  background: linear-gradient(135deg, #94a3b8, #38bdf8);
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 1140px;
  min-height: 670px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
  animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.left-panel,
.right-panel {
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.left-panel {
  flex: 1.05;
  padding: 48px 42px;
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-right: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 14px;
  animation: rise 0.8s ease both;
}

.logo-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.4);
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.brand-title span {
  color: var(--cyan);
}

.brand-subtitle {
  font-size: 10.5px;
  color: var(--ink-faint);
  margin-top: 3px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.hero-stage {
  animation: rise 0.75s ease both;
}

.hero-text {
  margin: 34px 0 0;
}

.hero-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-text h1 {
  font-size: 38px;
  font-weight: 600;
  line-height: 1.12;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.hero-text h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-text p {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--ink-soft);
  max-width: 390px;
  margin-bottom: 26px;
}

.feature-list {
  list-style: none;
}

.feature-list li {
  font-size: 13.5px;
  margin-bottom: 13px;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 400;
  animation: rise 0.6s ease both;
}

.feature-list li:nth-child(2) {
  animation-delay: 0.08s;
}

.feature-list li:nth-child(3) {
  animation-delay: 0.16s;
}

.feat-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  flex: none;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cyan);
}

.insight-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 26px;
}

.insight-strip > div {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid var(--glass-border);
}

.insight-strip strong {
  display: block;
  font-size: 18px;
  line-height: 1;
  margin-bottom: 6px;
  color: var(--ink);
}

.insight-strip span {
  display: block;
  font-size: 11px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.right-panel {
  flex: 1;
  padding: 46px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  animation: rise 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s both;
}

.login-card {
  width: 100%;
  max-width: 380px;
  margin: auto 0;
}

.login-card h2 {
  font-weight: 600;
  font-size: 22px;
  text-align: center;
  margin-bottom: 22px;
  color: var(--ink);
}

.view-fade {
  animation: rise 0.38s ease-out both;
}

.role-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 22px;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / 3);
  background: var(--glass-strong);
  border-radius: 9px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 0 18px rgba(0, 212, 255, 0.35);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.45s ease, border-color 0.45s ease;
  z-index: 1;
}

.tab-btn {
  position: relative;
  z-index: 2;
  border: none;
  background: transparent;
  padding: 10px 4px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--ink-faint);
  font-family: Inter, sans-serif;
  transition: color 0.25s ease, transform 0.25s ease;
}

.tab-btn:hover {
  transform: translateY(-1px);
}

.tab-icon {
  transition: transform 0.25s ease, color 0.25s ease;
}

.tab-btn.active {
  color: var(--cyan);
}

.tab-btn.active .tab-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 6px var(--cyan));
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 7px;
  letter-spacing: 0.2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper svg {
  position: absolute;
  left: 14px;
  color: var(--ink-faint);
}

.input-wrapper input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass-bg);
  color: var(--ink);
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: var(--ink-faint);
}

.input-wrapper input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.16);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 18px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-soft);
  cursor: pointer;
}

.remember-me input {
  accent-color: var(--cyan);
  cursor: pointer;
}

.forgot-password {
  color: var(--cyan);
  text-decoration: none;
  font-weight: 600;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(100deg, var(--violet), var(--cyan));
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  box-shadow: 0 12px 26px rgba(138, 43, 226, 0.35);
  font-family: inherit;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(0, 212, 255, 0.4);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-secondary {
  width: 100%;
  padding: 11px;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  cursor: pointer;
  background: var(--glass-bg);
  color: var(--ink);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  font-family: inherit;
}

.btn-secondary:hover {
  border-color: var(--cyan);
  background: var(--glass-strong);
  transform: translateY(-2px);
}

.btn-back {
  background: none;
  border: none;
  color: var(--cyan);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 12px;
  font-family: inherit;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 18px 0;
  color: var(--ink-faint);
  font-size: 11px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--glass-border);
}

.divider span {
  padding: 0 10px;
}

.social-logins {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.social-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 10px 4px;
  cursor: pointer;
  font-size: 10px;
  color: var(--ink-soft);
  font-weight: 500;
  font-family: inherit;
}

.social-btn:hover {
  border-color: var(--cyan);
  transform: translateY(-2px);
}

.social-btn span {
  line-height: 1;
}

.signup-text {
  text-align: center;
  font-size: 11.5px;
  color: var(--ink-faint);
}

.signup-link-row {
  margin-top: 14px;
}

.signup-text a {
  color: var(--ink-soft);
  font-weight: 600;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

.page-footer {
  width: 100%;
  max-width: 380px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--ink-faint);
  padding-top: 18px;
}

.page-footer a {
  color: var(--ink-faint);
  text-decoration: none;
}

.page-footer a:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .ssai-root,
  .container,
  .view-fade,
  .constellation circle.signal,
  .orb {
    animation: none !important;
  }

  .ssai-root *,
  .ssai-root *::before,
  .ssai-root *::after {
    transition: none !important;
  }
}

@media (max-width: 960px) {
  .ssai-root {
    padding: 16px;
  }

  .theme-switcher-list {
    justify-content: flex-start;
  }

  .top-nav {
    gap: 14px;
  }

  .container {
    flex-direction: column;
    max-width: 520px;
    min-height: auto;
  }

  .left-panel {
    padding: 32px 28px;
    border-right: 1px solid var(--glass-border);
    border-bottom: none;
  }

  .hero-text h1 {
    font-size: 29px;
  }

  .insight-strip {
    grid-template-columns: 1fr;
  }

  .right-panel {
    padding: 32px 22px;
  }
}

@media (min-width: 561px) and (max-width: 960px) {
  .ssai-root {
    align-items: flex-start;
  }

  .container {
    width: min(100%, 760px);
  }

  .left-panel,
  .right-panel {
    padding: 30px;
  }

  .hero-text {
    max-width: 620px;
    margin-inline: auto;
  }

  .insight-strip {
    grid-template-columns: repeat(3, 1fr);
  }

  .insight-strip > div {
    padding: 12px;
  }

  .right-panel {
    align-items: stretch;
  }

  .login-card,
  .page-footer {
    max-width: 520px;
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .ssai-root {
    align-items: flex-start;
    padding: 10px;
  }

  .container {
    border-radius: 18px;
  }

  .left-panel,
  .right-panel {
    padding: 24px 18px;
  }

  .logo-area {
    gap: 10px;
  }

  .logo-icon {
    width: 42px;
    height: 42px;
  }

  .brand-title {
    font-size: 18px;
  }

  .brand-subtitle {
    font-size: 8px;
    letter-spacing: 0.22em;
  }

  .hero-text {
    margin-top: 26px;
  }

  .hero-text h1 {
    font-size: clamp(26px, 8vw, 31px);
  }

  .hero-text p {
    font-size: 13.5px;
  }

  .insight-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  .insight-strip > div {
    padding: 10px 8px;
  }

  .insight-strip strong {
    font-size: 16px;
  }

  .insight-strip span {
    font-size: 9px;
    letter-spacing: 0.04em;
  }

  .right-panel {
    align-items: stretch;
  }

  .login-card h2 {
    font-size: 20px;
  }

  .form-options {
    gap: 12px;
    flex-wrap: wrap;
  }

  .forgot-password {
    margin-left: auto;
  }

  .theme-switcher {
    gap: 6px;
    padding: 8px 10px;
    border-radius: 999px;
  }

  .theme-switcher-label {
    display: none;
  }

  .theme-switcher-list {
    width: auto;
    justify-content: flex-start;
    gap: 6px;
  }

  .theme-chip {
    flex: 0 0 auto;
    justify-content: center;
    padding-inline: 9px;
  }

  .top-nav {
    align-items: stretch;
  }

  .social-logins {
    flex-direction: column;
  }

  .page-footer {
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }
}
`;
