import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  GraduationCap,
  HelpCircle,
  Info,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  Radar as RadarIcon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getStudents, toDashboardStudent } from "./api.js";
import BrandLogo from "./BrandLogo.jsx";

const Cat = () => <BrandLogo state="signedIn" />;

const THEME_STORAGE_KEY = "studentsuccess-theme";
const LEGACY_THEME_STORAGE_KEY = "studentsuccess-dashboard-theme";

const THEMES = [
  { id: "midnight", label: "Midnight" },
  { id: "aurora", label: "Aurora" },
  { id: "sunrise", label: "Sunrise" },
  { id: "graphite", label: "Graphite" },
];

const NAV_LINKS = [
  { id: "home", label: "Home", icon: GraduationCap },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "prediction", label: "Prediction", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "about", label: "About us", icon: Info },
];

const SUPPORT_CHANNELS = [
  {
    id: "email",
    label: "Email Platform Admins",
    hint: "Send direct inquiry to administrator@learnova.ai",
    href: "mailto:administrator@learnova.ai?subject=%5BLearnova%20Support%5D",
    icon: Mail,
  },
  {
    id: "github",
    label: "Raise an issue on GitHub",
    hint: "Open an issue directly tagged to core maintainers",
    href: "https://github.com/studentsuccess-ai/support",
    icon: BookOpen,
  },
  {
    id: "linkedin",
    label: "Message on LinkedIn",
    hint: "Contact the Learnova organization team",
    href: "https://www.linkedin.com/company/studentsuccess-ai",
    icon: Users,
  },
];

const TERMS = ["T1", "T2", "T3", "T4", "T5", "T6"];

const SEMESTER_SUBJECTS = {
  1: ["Python Programming", "Operating System", "Programming in C", "Web Development", "Database Management System (DBMS)"],
  2: ["Data Structures & Algorithms", "Computer Networks", "Python Programming", "Artificial Intelligence & Machine Learning", "Programming in C"],
  3: ["Database Management System (DBMS)", "Web Development", "Operating System", "Data Structures & Algorithms", "Artificial Intelligence & Machine Learning"],
  4: ["Computer Networks", "Python Programming", "Database Management System (DBMS)", "Programming in C", "Web Development"],
  5: ["Artificial Intelligence & Machine Learning", "Data Structures & Algorithms", "Operating System", "Computer Networks", "Python Programming"],
  6: ["Web Development", "Database Management System (DBMS)", "Artificial Intelligence & Machine Learning", "Computer Networks", "Data Structures & Algorithms"],
};
const ACADEMIC_SUBJECTS = Array.from(new Set(Object.values(SEMESTER_SUBJECTS).flat()));

function subjectsForClass(semester) { return SEMESTER_SUBJECTS[semester] || ACADEMIC_SUBJECTS; }

const CLASSES = Array.from({ length: 6 }, (_, i) => i + 1);

function rand(seed) {
  const x = Math.sin(seed * 999.7 + 13.7) * 10000;
  return x - Math.floor(x);
}

let STUDENTS = [];
function allSubjects() { return Array.from(new Set([...ACADEMIC_SUBJECTS, ...STUDENTS.flatMap((student) => student.scores.map((item) => item.subject))])).sort(); }
function studentsInClass(semester) { return semester ? STUDENTS.filter((student) => student.cls === semester) : STUDENTS; }
function classAverageBySubject(cls) { return subjectsForClass(cls).map((subject) => { const values = studentsInClass(cls).map((student) => student.scores.find((item) => item.subject === subject)?.score).filter(Boolean); return { subject, score: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) || 0 }; }); }
function classAverageEngagement(cls) { const students = cls ? studentsInClass(cls) : STUDENTS; return ["Attendance", "Assignments", "Participation", "Homework", "Midterm"].map((metric) => ({ metric, avgScore: Math.round(students.reduce((sum, student) => sum + (student.engagementMetrics.find((item) => item.metric === metric)?.score || 0), 0) / students.length) })); }
function classAverageTrend(cls) { const students = studentsInClass(cls); return students.length && students.every((student) => student.trend) ? TERMS.map((term, index) => ({ term, value: Math.round(students.reduce((sum, student) => sum + student.trend[index], 0) / students.length) })) : []; }
function schoolAverageTrend() { return STUDENTS.length && STUDENTS.every((student) => student.trend) ? TERMS.map((term, index) => ({ term, value: Math.round(STUDENTS.reduce((sum, student) => sum + student.trend[index], 0) / STUDENTS.length) })) : []; }
function riskDistribution(students) { const counts = { ontrack: 0, atrisk: 0, critical: 0 }; students.forEach((student) => { counts[student.riskLevel] += 1; }); return [{ name: "On track", value: counts.ontrack, id: "ontrack" }, { name: "At risk", value: counts.atrisk, id: "atrisk" }, { name: "Critical", value: counts.critical, id: "critical" }]; }
function subjectAcrossClasses(subject) { return CLASSES.filter((semester) => studentsInClass(semester).length && subjectsForClass(semester).includes(subject)).map((semester) => ({ cls: `Semester ${semester}`, score: classAverageBySubject(semester).find((row) => row.subject === subject)?.score || 0 })); }
function GlassTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label ? <div className="chart-tooltip-label">{label}</div> : null}
      {payload.map((entry, index) => (
        <div className="chart-tooltip-row" key={`${entry.dataKey || entry.name}-${index}`}>
          <span className="chart-tooltip-dot" style={{ background: entry.color || entry.fill }} />
          <span className="chart-tooltip-name">{entry.name || entry.dataKey}</span>
          <span className="chart-tooltip-value">{entry.value}{unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

function ThemeStrip({ theme, setTheme }) { return <div className="theme-strip" role="group" aria-label="Theme options"><span className="theme-strip-label">THEME</span>{THEMES.map((option) => <button key={option.id} type="button" className={`theme-strip-item${theme === option.id ? " active" : ""}`} onClick={() => setTheme(option.id)}><span className="theme-swatch" data-theme={option.id} />{option.label}</button>)}</div>; }
function NavBar({ active, onNavigate }) { return <nav className="navbar" aria-label="Primary">{NAV_LINKS.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`navbar-link${active === id ? " active" : ""}`} onClick={() => onNavigate(id)}><Icon size={15} />{label}</button>)}</nav>; }
function LogoutButton({ onLogout }) { return <button type="button" className="logout-trigger" onClick={onLogout}><User size={14} />Logout</button>; }
function KpiCard({ icon: Icon, label, value, delta, deltaLabel, tone }) { return <div className={`kpi-card kpi-card-${tone}`}><div className="kpi-top"><span className={`kpi-icon kpi-icon-${tone}`}><Icon size={16} /></span>{delta !== undefined ? <span className={`kpi-delta ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(delta)}{deltaLabel}</span> : null}</div><div className="kpi-value">{value}</div><div className="kpi-label">{label}</div><span className="kpi-glow" /></div>; }
function SubjectMiniBar({ value }) { return <div className="subject-mini-row"><div className="subject-mini-track"><div className="subject-mini-fill" style={{ width: `${value}%` }} /></div><span className="subject-mini-value">{value}</span></div>; }
function AccentLastWord({ text }) { const words = text.split(" "); return <>{words.slice(0, -1).join(" ")} {words.length > 1 ? <em>{words[words.length - 1]}</em> : null}</>; }

function HomePage({ onSearch }) {
  const [nameQuery, setNameQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const nameMatches = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();
    return query ? STUDENTS.filter((student) => student.name.toLowerCase().includes(query)).slice(0, 6) : [];
  }, [nameQuery]);
  const subjectOptions = classQuery ? subjectsForClass(Number(classQuery)) : allSubjects();

  return (
    <div className="home-page">
      <section className="hero-block"><span className="hero-kicker"><Sparkles size={12} /> AI guided student support</span><h1>Find any student, semester, or subject <em>in seconds.</em></h1><p>Search across every semester from 1 through 6 to see how a student or subject is trending before it shows up on a report card.</p></section>
        <section className="search-grid">
        <div className="search-card"><div className="search-card-head"><span className="search-card-icon"><Search size={15} /></span><div><h3>Search by student</h3><p>Find a student by name</p></div></div><div className="search-input-wrap"><input type="text" placeholder="e.g. Priya Nandakumar" value={nameQuery} onChange={(event) => setNameQuery(event.target.value)} /></div>{nameMatches.length ? <div className="search-suggestions">{nameMatches.map((student) => <button key={student.id} type="button" className="search-suggestion" onClick={() => onSearch({ studentId: student.id, cls: student.cls, subject: null })}>{student.name}<ArrowRight size={14} /></button>)}</div> : null}<button type="button" className="search-submit" disabled={!nameMatches.length} onClick={() => nameMatches[0] && onSearch({ studentId: nameMatches[0].id, cls: nameMatches[0].cls, subject: null })}>View student <ArrowRight size={14} /></button></div>
        <div className="search-card"><div className="search-card-head"><span className="search-card-icon"><GraduationCap size={15} /></span><div><h3>Search by semester</h3><p>Browse a semester, 1 through 6</p></div></div><select value={classQuery} onChange={(event) => setClassQuery(event.target.value)}><option value="">Select a semester</option>{CLASSES.map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select><button type="button" className="search-submit" disabled={!classQuery} onClick={() => onSearch({ studentId: null, cls: Number(classQuery), subject: null })}>View semester <ArrowRight size={14} /></button></div>
        <div className="search-card"><div className="search-card-head"><span className="search-card-icon"><BookOpen size={15} /></span><div><h3>Search by subject</h3><p>Compare a subject across semesters</p></div></div><select value={subjectQuery} onChange={(event) => setSubjectQuery(event.target.value)}><option value="">Select a subject</option>{subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select><button type="button" className="search-submit" disabled={!subjectQuery} onClick={() => onSearch({ studentId: null, cls: classQuery ? Number(classQuery) : null, subject: subjectQuery })}>View subject <ArrowRight size={14} /></button></div>
      </section>
      <section className="home-stats"><div><strong>{STUDENTS.length}</strong><span>students tracked</span></div><div><strong>6</strong><span>semesters covered</span></div><div><strong>{allSubjects().length}</strong><span>subjects monitored</span></div></section>
    </div>
  );
}

/* The malformed duplicate block below is retained temporarily for a precise cleanup. */
/* function CorruptedHomePage({ onSearch }) {
  const [nameQuery, setNameQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");

  const chance = Math.max(18, Math.min(96, Math.round(prediction.predictedGpa * 10 + prediction.attendance / 5)));
  const studyHours = Math.max(42, Math.min(92, Math.round((student.overall + prediction.attendance) / 2)));
  const labPerformance = student.scores.find((item) => item.subject === "Science")?.score || student.overall;
  const signalRows = [
    ["Attendance", prediction.attendance, prediction.attendance >= 75 ? "Positive" : "Needs attention"],
    ["Assignments", prediction.assignments, prediction.assignments >= 70 ? "Positive" : "Needs attention"],
    ["Internal Marks", student.overall, student.overall >= 70 ? "Positive" : "Medium"],
    ["Study Hours", studyHours, studyHours >= 70 ? "Positive" : "Medium"],
    ["Lab Performance", labPerformance, labPerformance >= 70 ? "Positive" : "Needs attention"],
  ];
  const recommendationCards = [
    { icon: CalendarDays, title: "Improve Study Consistency", text: "Maintain a regular study schedule of 14+ hours per week.", tone: "green", impact: "High Impact" },
    { icon: BookOpen, title: "Focus on Assignments", text: "Complete assignments on time to improve overall score.", tone: "cyan", impact: "Medium Impact" },
    { icon: Target, title: "Enhance Lab Performance", text: "Participate more in lab sessions and practical activities.", tone: "amber", impact: "Medium Impact" },
    { icon: Brain, title: "Manage Study Hours", text: "Try to balance study hours and maintain consistency.", tone: "violet", impact: "Low Impact" },
  ];
  const nameMatches = useMemo(() => {
    if (!nameQuery.trim()) return [];
    <div className="prediction-page">
      <section className="prediction-hero">
  }, [nameQuery]);

  const subjectOptions = useMemo(() => {
    if (!classQuery) return allSubjects();
    return subjectsForClass(Number(classQuery));
      <section className="prediction-selector">
        <span className="prediction-selector-icon"><Search size={15} /></span>
        <div><strong>Choose a student</strong><small>Prediction updates instantly when you select a name</small></div>
        <select value={student.id} onChange={(event) => setStudentId(event.target.value)} aria-label="Choose a student">
          {STUDENTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button type="button" className="prediction-refresh" onClick={() => setStudentId(STUDENTS[(STUDENTS.findIndex((item) => item.id === student.id) + 1) % STUDENTS.length].id)}>
          <Sparkles size={13} /> New Prediction
        </button>
        </h1>
        <p>
      <div className="prediction-grid">
        <div className="prediction-card prediction-gpa-card">
          <div className="prediction-card-head"><span className="prediction-icon violet"><TrendingUp size={15} /></span><div><h3>Predicted GPA</h3><p>{student.name} - Semester {student.cls}</p></div></div>
          <strong className="prediction-gpa" style={{ color: riskTone }}>{prediction.predictedGpa.toFixed(2)} <small>/ 10</small></strong>
          <span className="prediction-caption">Predicted GPA</span>
          <div className="prediction-rule" />
          <div className="prediction-risk-line"><span>Risk Level</span><strong style={{ color: riskTone }}>{prediction.riskLevel}</strong><b><ShieldCheck size={12} /> {Math.max(24, 100 - chance)}% Safe</b></div>
        <div className="search-card">

        <div className="prediction-card prediction-signals-card">
          <div className="prediction-card-head"><span className="prediction-icon cyan"><RadarIcon size={15} /></span><div><h3>Prediction signals</h3><p>Current indicators used for this forecast</p></div></div>
          <div className="prediction-signals">{signalRows.map(([label, value, status]) => <div className="prediction-signal" key={label}><span>{label}</span><div className="prediction-signal-track"><i style={{ width: `${value}%` }} /></div><b>{value}%</b><em className={status === "Positive" ? "positive" : status === "Medium" ? "medium" : "attention"}>{status}</em></div>)}</div>
              <p>Find a student by name</p>

        <div className="prediction-card prediction-chance-card">
          <div className="prediction-card-head"><span className="prediction-icon cyan"><Target size={15} /></span><div><h3>Success probability</h3><p>Based on current performance</p></div></div>
          <div className="prediction-ring" style={{ "--ring-progress": `${chance * 3.6}deg` }}><div><strong>{chance}%</strong><span>High Chance</span></div></div>
          <div className="prediction-mini-stats"><span><strong>Top 20%</strong><small>Percentile</small></span><span><strong>↗ Improving</strong><small>Positive Trend</small></span></div>
            <input

        <div className="prediction-card prediction-factors-card"><div className="prediction-card-head"><span className="prediction-icon violet"><Flame size={15} /></span><div><h3>Key factors impacting performance</h3><p>Signals that influence the forecast</p></div></div><div className="factor-table"><span>FACTOR</span><span>IMPACT</span>{signalRows.map(([label, value, status]) => <Fragment key={label}><b>{label}</b><em className={status === "Positive" ? "positive" : status === "Medium" ? "medium" : "attention"}>{value >= 75 ? "↑" : value >= 65 ? "—" : "↓"} <small>{status}</small></em></Fragment>)}</div></div>

        <div className="prediction-card prediction-distribution-card"><div className="prediction-card-head"><span className="prediction-icon cyan"><BarChart3 size={15} /></span><div><h3>Performance distribution</h3><p>Current score breakdown</p></div></div><div className="distribution-content"><div className="distribution-ring"><strong>{student.overall}</strong><span>Score</span></div><div className="distribution-legend"><span><i className="high" /> High (70-100%) <b>{student.overall >= 70 ? "62%" : "38%"}</b></span><span><i className="medium" /> Medium (40-69%) <b>{student.overall >= 70 ? "28%" : "42%"}</b></span><span><i className="low" /> Low (0-39%) <b>{student.overall >= 70 ? "10%" : "20%"}</b></span></div></div></div>

        <div className="prediction-card prediction-risk-card"><div className="prediction-card-head"><span className="prediction-icon cyan"><ShieldCheck size={15} /></span><div><h3>Risk level details</h3><p>Recommended monitoring status</p></div></div><strong className="risk-detail-title" style={{ color: riskTone }}>{prediction.riskLevel}</strong><div className="risk-scale"><i style={{ left: `${Math.max(12, Math.min(92, chance))}%` }} /></div><p className="risk-detail-copy">The student shows {student.overall >= 70 ? "strong performance in most areas but requires attention" : "several areas that require focused support"} in performance and study hours.</p></div>

        <div className="prediction-recommendations"><div className="prediction-section-title"><span><Sparkles size={15} /> AI Recommendations</span><small>Personalized suggestions to improve performance</small></div><div className="recommendation-grid">{recommendationCards.map(({ icon: Icon, title, text, tone, impact }) => <div className="recommendation-card" key={title}><span className={`recommendation-icon ${tone}`}><Icon size={19} /></span><div><strong>{title}</strong><p>{text}</p><em className={tone}>{impact}</em></div></div>)}</div></div>
        <div className="prediction-actions"><button type="button" className="prediction-reset" onClick={() => setStudentId(STUDENTS[0].id)}><Activity size={13} /> Reset</button><button type="button" className="prediction-generate" onClick={() => setStudentId(STUDENTS[(STUDENTS.findIndex((item) => item.id === student.id) + 1) % STUDENTS.length].id)}><Sparkles size={13} /> Generate New Prediction</button></div>
              onChange={(e) => setNameQuery(e.target.value)}
            />
            {nameQuery ? (
              <button type="button" className="search-clear" onClick={() => setNameQuery("")} aria-label="Clear">
                <X size={13} />
              </button>
            ) : null}
          </div>
          {nameMatches.length > 0 ? (
            <div className="search-suggestions">
              {nameMatches.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="search-suggestion"
                  onClick={() => onSearch({ studentId: student.id, cls: student.cls, subject: null })}
                >
                  <span className="watchlist-avatar">
                    {student.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <span>
                    <span className="watchlist-name">{student.name}</span>
                    <span className="watchlist-id">Semester {student.cls} &middot; {student.id}</span>
                  </span>
                  <ArrowRight size={14} className="search-suggestion-arrow" />
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="search-submit"
            disabled={nameMatches.length === 0}
            onClick={() => nameMatches[0] && onSearch({ studentId: nameMatches[0].id, cls: nameMatches[0].cls, subject: null })}
          >
            View student <ArrowRight size={14} />
          </button>
        </div>

        <div className="search-card">
          <div className="search-card-head">
            <span className="search-card-icon">
              <GraduationCap size={15} />
            </span>
            <div>
              <h3>Search by semester</h3>
              <p>Browse a semester, 1 through 6</p>
            </div>
          </div>
          <select value={classQuery} onChange={(e) => setClassQuery(e.target.value)}>
            <option value="">Select a semester</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                Semester {cls}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="search-submit"
            disabled={!classQuery}
            onClick={() => onSearch({ studentId: null, cls: Number(classQuery), subject: null })}
          >
            View semester <ArrowRight size={14} />
          </button>
        </div>

        <div className="search-card">
          <div className="search-card-head">
            <span className="search-card-icon">
              <BookOpen size={15} />
            </span>
            <div>
              <h3>Search by subject</h3>
              <p>Compare a subject across semesters</p>
            </div>
          </div>
          <select value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)}>
            <option value="">Select a subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="search-submit"
            disabled={!subjectQuery}
            onClick={() =>
              onSearch({
                studentId: null,
                cls: classQuery ? Number(classQuery) : null,
                subject: subjectQuery,
              })
            }
          >
            View subject <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="home-stats">
        <div>
          <strong>{STUDENTS.length}</strong>
          <span>students tracked</span>
        </div>
        <div>
          <strong>12</strong>
          <span>semesters covered</span>
        </div>
        <div>
          <strong>{allSubjects().length}</strong>
          <span>subjects monitored</span>
        </div>
      </section>
    </div>
  );
}

*/

function DashboardPage({ filters, setFilters }) {
  const { cls, studentId, subject } = filters;

  const scopedStudents = cls ? studentsInClass(cls) : STUDENTS;
  const selectedStudent = studentId ? STUDENTS.find((s) => s.id === studentId) : null;

  const trendData = useMemo(() => {
    const baseline = cls ? classAverageTrend(cls) : schoolAverageTrend();
    return TERMS.map((term, i) => ({
      term,
      baseline: baseline[i]?.value,
      selected: selectedStudent?.trend ? selectedStudent.trend[i] : undefined,
    }));
  }, [cls, selectedStudent]);

  const subjectClass = cls || selectedStudent?.cls || null;
  const subjectData = useMemo(() => {
    if (subject && !cls && !selectedStudent) {
      return { mode: "acrossClasses", rows: subjectAcrossClasses(subject) };
    }
    const classAvg = classAverageBySubject(subjectClass);
    const rows = classAvg.map((row) => ({
      subject: row.subject,
      classAvg: row.score,
      studentScore: selectedStudent
        ? selectedStudent.scores.find((s) => s.subject === row.subject)?.score
        : undefined,
    }));
    return { mode: "bySubject", rows };
  }, [subject, cls, selectedStudent, subjectClass]);

  const engagementData = useMemo(() => {
    const classAvg = classAverageEngagement(cls);
    return classAvg.map((row) => ({
      metric: row.metric,
      avgScore: row.avgScore,
      studentScore: selectedStudent
        ? selectedStudent.engagementMetrics.find((m) => m.metric === row.metric)?.score
        : undefined,
    }));
  }, [cls, selectedStudent]);

  const risk = riskDistribution(scopedStudents);
  const riskTotal = risk.reduce((sum, r) => sum + r.value, 0);

  const watchlist = useMemo(
    () => [...scopedStudents].sort((a, b) => a.overall - b.overall).slice(0, 6),
    [scopedStudents]
  );

  const lowestSubjectRow = subjectData.mode === "bySubject"
    ? [...subjectData.rows].sort((a, b) => a.classAvg - b.classAvg)[0]
    : null;

  const cohortAvg = trendData.length ? trendData[trendData.length - 1].baseline : null;
  const cohortAvgPrior = trendData.length > 1 ? trendData[trendData.length - 2].baseline : null;
  const criticalCount = risk[2].value;
  const attentionRate = riskTotal ? Math.round(((risk[1].value + risk[2].value) / riskTotal) * 100) : 0;
  const strongestStudent = scopedStudents.length ? [...scopedStudents].sort((a, b) => b.overall - a.overall)[0] : null;
  const insightSubject = lowestSubjectRow?.subject || "Core subjects";
  const insightSubjectScore = lowestSubjectRow?.classAvg ?? 0;

  return (
    <div className="dashboard-page">
      <header className="dash-header">
        <div className="dash-header-title">
          <h1>
            <AccentLastWord text={selectedStudent ? selectedStudent.name : cls ? `Semester ${cls} performance` : subject ? `${subject} across semesters` : "Cohort performance overview"} />
          </h1>
          <p>
            {selectedStudent
              ? `Semester ${selectedStudent.cls} \u00b7 ${selectedStudent.id}`
              : "Live view of academic risk signals across every semester and subject"}
          </p>
        </div>
        <div className="dash-header-meta">
          <span className="term-pill">
            <Activity size={12} />
            Spring term &middot; Week 24
          </span>
          <span className="cohort-pill">
            <Users size={12} />
            {scopedStudents.length} students in view
          </span>
        </div>
      </header>

      <section className="dashboard-command-center">
        <div className="command-main">
          <span className="command-kicker"><Brain size={14} /> Intelligence brief</span>
          <h2>{attentionRate}% of this view needs academic attention</h2>
          <p>
            {selectedStudent
              ? `${selectedStudent.name} is being compared against semester ${selectedStudent.cls} signals across performance, engagement, and risk.`
              : criticalCount
              ? `${criticalCount} students are in the critical band, with ${insightSubject} showing the weakest average signal at ${insightSubjectScore}%.`
              : "Most students are on track. Use filters to drill into semester, subject, or individual patterns."}
          </p>
        </div>
        <div className="command-metrics">
          <div><span>Priority</span><strong>{criticalCount}</strong><small>critical cases</small></div>
          <div><span>Best signal</span><strong>{strongestStudent?.overall ?? "N/A"}{strongestStudent ? "%" : ""}</strong><small>{strongestStudent?.name || "No student selected"}</small></div>
          <div><span>Focus area</span><strong>{insightSubjectScore || "N/A"}{insightSubjectScore ? "%" : ""}</strong><small>{insightSubject}</small></div>
        </div>
      </section>

      <div className="filter-bar">
        <label className="filter-field">
          <span>Semester</span>
          <select
            value={cls || ""}
            onChange={(e) =>
              setFilters({
                cls: e.target.value ? Number(e.target.value) : null,
                studentId: null,
                subject: filters.subject,
              })
            }
          >
            <option value="">All semesters</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                Semester {c}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
            <span>Student name</span>
          <select
            value={studentId || ""}
            onChange={(e) =>
              setFilters({
                cls: e.target.value ? STUDENTS.find((s) => s.id === e.target.value)?.cls : cls,
                studentId: e.target.value || null,
                subject: null,
              })
            }
          >
            <option value="">All students</option>
            {scopedStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Subject</span>
          <select
            value={subject || ""}
            onChange={(e) => setFilters({ cls, studentId, subject: e.target.value || null })}
          >
            <option value="">All subjects</option>
            {(cls ? subjectsForClass(cls) : allSubjects()).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {(cls || studentId || subject) && (
          <button type="button" className="filter-reset" onClick={() => setFilters({ cls: null, studentId: null, subject: null })}>
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>

      <section className="kpi-grid">
        <KpiCard
          icon={TrendingUp}
          label={selectedStudent ? "Student overall score" : "Average score"}
          value={selectedStudent ? `${selectedStudent.overall}%` : cohortAvg !== null ? `${cohortAvg}%` : "N/A"}
          delta={selectedStudent?.trend ? selectedStudent.trend[5] - selectedStudent.trend[4] : cohortAvg !== null && cohortAvgPrior !== null ? cohortAvg - cohortAvgPrior : undefined}
          deltaLabel=" pts"
          tone="cyan"
        />
        <KpiCard
          icon={ShieldCheck}
          label="On track"
          value={`${riskTotal ? Math.round((risk[0].value / riskTotal) * 100) : 0}%`}
          tone="violet"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Flagged at risk"
          value={risk[1].value + risk[2].value}
          tone="amber"
        />
        <KpiCard
          icon={BookOpen}
          label={
            selectedStudent
              ? "Strongest subject"
              : lowestSubjectRow
              ? `Needs attention: ${lowestSubjectRow.subject}`
              : "Subjects tracked"
          }
          value={
            selectedStudent
              ? `${[...selectedStudent.scores].sort((a, b) => b.score - a.score)[0].subject}`
              : lowestSubjectRow
              ? `${lowestSubjectRow.classAvg}%`
              : subjectsForClass(subjectClass).length
          }
          tone="green"
        />
      </section>

      <section className="dash-grid">
        <div className={`panel panel-wide${selectedStudent?.overall >= 75 ? " student-highlight" : ""}`}>
          <div className="panel-head">
            <div>
              <h3>Overall performance trend</h3>
              <p>
                {selectedStudent ? `${selectedStudent.name} vs. ${cls ? `semester ${cls}` : "school"} average` : cls ? `Semester ${cls} vs. school average` : "Cohort average across terms"}
              </p>
            </div>
          </div>
          <div className="panel-chart panel-chart-tall">
            <ResponsiveContainer width="100%" height="100%" debounce={80}>
              <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="selectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--glass-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="term" tick={{ fill: "var(--ink-faint)", fontSize: 11 }} axisLine={{ stroke: "var(--glass-border)" }} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fill: "var(--ink-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
                <Tooltip content={<GlassTooltip unit="%" />} cursor={{ stroke: "var(--glass-border)" }} />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  name={selectedStudent ? (cls ? `Semester ${cls} avg` : "School avg") : cls ? `Semester ${cls} avg` : "Cohort avg"}
                  stroke="var(--cyan)"
                  strokeWidth={2.5}
                  fill="url(#baselineFill)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--cyan)" }}
                />
                {selectedStudent ? (
                  <Area
                    type="monotone"
                    dataKey="selected"
                    name={selectedStudent.name}
                    stroke="var(--violet)"
                    strokeWidth={3}
                    fill="url(#selectedFill)"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 6, fill: "var(--violet)", stroke: "var(--ink)", strokeWidth: 2 }}
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "var(--cyan)" }} />
              {selectedStudent ? (cls ? `Semester ${cls} average` : "School average") : cls ? `Semester ${cls} average` : "Cohort average"}
            </span>
            {selectedStudent ? (
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "var(--violet)" }} />
                {selectedStudent.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Risk distribution</h3>
              <p>{cls ? `Semester ${cls}` : "Whole school"} &middot; {riskTotal} students</p>
            </div>
          </div>
          <div className="panel-chart panel-chart-donut">
            <ResponsiveContainer width="100%" height="100%" debounce={80}>
              <PieChart>
                <Pie data={risk} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none" isAnimationActive={false}>
                  <Cell fill="var(--cyan)" />
                  <Cell fill="var(--violet)" />
                  <Cell fill="#ff6b6b" />
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{riskTotal ? Math.round((risk[0].value / riskTotal) * 100) : 0}%</strong>
              <span>on track</span>
            </div>
          </div>
          <div className="donut-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "var(--cyan)" }} />
              On track &middot; {risk[0].value}
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "var(--violet)" }} />
              At risk &middot; {risk[1].value}
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "#ff6b6b" }} />
              Critical &middot; {risk[2].value}
            </span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Subject-wise performance</h3>
                <p>
                {subjectData.mode === "acrossClasses"
                  ? `${subject} average by semester`
                  : selectedStudent
                  ? `${selectedStudent.name} vs. semester ${subjectClass} average`
                  : `${subjectClass ? `Semester ${subjectClass}` : "Whole school"} average by subject`}
              </p>
            </div>
          </div>
          <div className="panel-chart panel-chart-tall">
            <ResponsiveContainer width="100%" height="100%" debounce={80}>
              {subjectData.mode === "acrossClasses" ? (
                <BarChart data={subjectData.rows} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }} barCategoryGap={12}>
                  <CartesianGrid stroke="var(--glass-border)" strokeDasharray="3 6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--ink-faint)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="cls" tick={{ fill: "var(--ink-soft)", fontSize: 11.5 }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip content={<GlassTooltip unit="%" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="score" name={subject} radius={[0, 6, 6, 0]} barSize={22} maxBarSize={26} activeBar={{ fill: "var(--cyan)" }} isAnimationActive={false}>
                    {subjectData.rows.map((entry, index) => (
                      <Cell key={index} fill={entry.score < 70 ? "#ff6b6b" : "var(--cyan)"} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={subjectData.rows} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }} barCategoryGap={14}>
                  <CartesianGrid stroke="var(--glass-border)" strokeDasharray="3 6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--ink-faint)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="subject" tick={{ fill: "var(--ink-soft)", fontSize: 11.5 }} axisLine={false} tickLine={false} width={118} tickFormatter={(value) => value === "Database Management System (DBMS)" ? "DBMS" : value} />
                  <Tooltip content={<GlassTooltip unit="%" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="classAvg" name="Semester average" radius={[0, 6, 6, 0]} barSize={selectedStudent ? 10 : 22} maxBarSize={selectedStudent ? 12 : 26} fill="var(--cyan)" fillOpacity={1} activeBar={{ fill: "var(--cyan)" }} isAnimationActive={false}>
                    {subjectData.rows.map((entry, index) => (
                      <Cell key={index} fill={entry.classAvg < 70 ? "#ff6b6b" : "var(--cyan)"} />
                    ))}
                  </Bar>
                  {selectedStudent ? (
                    <Bar dataKey="studentScore" name={selectedStudent.name} radius={[0, 6, 6, 0]} barSize={10} maxBarSize={12} fill="var(--violet)" fillOpacity={1} activeBar={{ fill: "var(--violet)" }} isAnimationActive={false} />
                  ) : null}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          {lowestSubjectRow ? (
            <div className="panel-footnote">
              <Flame size={12} />
              {lowestSubjectRow.subject} trails at {lowestSubjectRow.classAvg}% for this scope.
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Subject profile</h3>
              <p>{selectedStudent ? `${selectedStudent.name} vs. semester average` : `${subjectClass ? `Semester ${subjectClass}` : "Whole school"} subject spread`}</p>
            </div>
          </div>
          <div className="panel-chart panel-chart-tall">
            <ResponsiveContainer width="100%" height="100%" debounce={80}>
              <RadarChart data={classAverageBySubject(subjectClass).map((row) => ({
                subject: row.subject,
                classAvg: row.score,
                student: selectedStudent ? selectedStudent.scores.find((s) => s.subject === row.subject)?.score : undefined,
              }))} outerRadius="72%">
                <PolarGrid stroke="var(--glass-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--ink-faint)", fontSize: 10.5 }} />
                <Radar name="Semester average" dataKey="classAvg" stroke="var(--ink-faint)" fill="var(--ink-faint)" fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} />
                {selectedStudent ? (
                  <Radar name={selectedStudent.name} dataKey="student" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.28} strokeWidth={2} isAnimationActive={false} />
                ) : null}
                <Tooltip content={<GlassTooltip unit="%" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "var(--ink-faint)" }} />
              Semester average
            </span>
            {selectedStudent ? (
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "var(--cyan)" }} />
                {selectedStudent.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Engagement & Attendance</h3>
              <p>{selectedStudent ? `${selectedStudent.name} attendance and behavioral indicators` : `Cohort average engagement metrics`}</p>
            </div>
          </div>
          <div className="panel-chart panel-chart-tall">
            <ResponsiveContainer width="100%" height="100%" debounce={80}>
              <RadarChart data={engagementData} outerRadius="72%">
                <PolarGrid stroke="var(--glass-border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--ink-faint)", fontSize: 10.5 }} />
                <Radar name="Cohort Average" dataKey="avgScore" stroke="var(--ink-faint)" fill="var(--ink-faint)" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
                {selectedStudent ? (
                  <Radar name={selectedStudent.name} dataKey="studentScore" stroke="var(--violet)" fill="var(--violet)" fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
                ) : null}
                <Tooltip content={<GlassTooltip unit="%" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: "var(--ink-faint)" }} />
              Cohort average
            </span>
            {selectedStudent ? (
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "var(--violet)" }} />
                {selectedStudent.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel panel-wide">
          <div className="panel-head">
            <div>
              <h3>Student watchlist</h3>
              <p>{cls ? `Semester ${cls}` : "Whole school"} &middot; lowest overall scores, click a row to inspect</p>
            </div>
          </div>
          <div className="watchlist">
            <div className="watchlist-row watchlist-head">
              <span>Student</span>
              <span>Semester</span>
              <span>Overall</span>
              <span>Trend</span>
            </div>
            {watchlist.map((student) => (
              <button
                type="button"
                className="watchlist-row watchlist-row-btn"
                key={student.id}
                onClick={() => setFilters({ cls: student.cls, studentId: student.id, subject: null })}
              >
                <span className="watchlist-student">
                  <span className="watchlist-avatar">
                    {student.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <span>
                    <span className="watchlist-name">{student.name}</span>
                    <span className="watchlist-id">{student.id}</span>
                  </span>
                </span>
                <span className="watchlist-subject">Semester {student.cls}</span>
                <span className="watchlist-overall">
                  <SubjectMiniBar value={student.overall} />
                </span>
                <span className={`watchlist-trend ${student.trend ? (student.trend[5] - student.trend[4] >= 0 ? "up" : "down") : "muted"}`}>
                  {student.trend ? <>{student.trend[5] - student.trend[4] >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(student.trend[5] - student.trend[4])} pts</> : "N/A"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function studentMetric(student, metric) {
  return student.engagementMetrics.find((item) => item.metric === metric)?.score || 0;
}

function predictStudent(student) {
  const attendance = studentMetric(student, "Attendance");
  const assignments = studentMetric(student, "Assignments");
  const participation = studentMetric(student, "Participation");
  const trendChange = student.trend ? student.trend[student.trend.length - 1] - student.trend[0] : 0;
  const predictedGpa = Math.max(0, Math.min(10, Number((student.overall / 10 + trendChange / 100).toFixed(2))));
  const riskLevel = predictedGpa < 6.0 || attendance < 65 ? "High Risk" : predictedGpa < 7.5 || attendance < 75 ? "Medium Risk" : "Low Risk";
  const factors = [];
  if (attendance < 75) factors.push(`Low attendance (${attendance}%)`);
  if (assignments < 70) factors.push(`Assignment performance needs attention (${assignments}%)`);
  if (participation < 70) factors.push(`Low participation (${participation}%)`);
  if (trendChange < 0) factors.push(`Downward term trend (${trendChange} points)`);
  if (!factors.length) factors.push("Consistent performance across monitored metrics");

  const recommendations = [];
  if (attendance < 75) recommendations.push("Improve attendance above 75%");
  if (assignments < 70) recommendations.push("Submit assignments on time and attend revision sessions");
  if (participation < 70) recommendations.push("Increase classroom participation and weekly check-ins");
  if (trendChange < 0) recommendations.push("Create a subject-focused support plan for the next term");
  if (!recommendations.length) recommendations.push("Maintain the current academic routine and explore advanced work");

  return { predictedGpa, riskLevel, factors, recommendations, attendance, assignments, participation };
}

function PredictionPage({ semester }) {
  const visibleStudents = semester ? STUDENTS.filter((item) => String(item.semester) === semester) : STUDENTS;
  const [studentId, setStudentId] = useState(visibleStudents[0]?.id || "");
  const student = visibleStudents.find((item) => item.id === studentId) || visibleStudents[0];
  if (!student) return <div className="empty-state">No students available.</div>;
  const prediction = predictStudent(student);
  const chance = Math.max(18, Math.min(96, Math.round(prediction.predictedGpa * 10 + prediction.attendance / 5)));
  const signals = [["Attendance", prediction.attendance], ["Assignments", prediction.assignments], ["Internal Marks", student.overall], ["Study Hours", Math.round((student.overall + prediction.attendance) / 2)], ["Lab Performance", student.scores.find((item) => item.subject === "Science")?.score || student.overall]];
  return <div className="prediction-page"><section className="prediction-hero"><span className="prediction-mascot" title="Student success companion"><Cat size={27} strokeWidth={1.8} /></span><span className="hero-kicker"><Activity size={12} /> AI performance prediction</span><h1>Predict student <em>success.</em></h1><p>Choose a student by name to view their projected GPA, current risk level, and the signals behind the prediction.</p></section><section className="prediction-selector"><span className="prediction-selector-icon"><Search size={15} /></span><div><strong>Choose a student</strong><small>Prediction updates instantly when you select a name</small></div><select value={student.id} onChange={(event) => setStudentId(event.target.value)} aria-label="Choose a student">{STUDENTS.map((item) => <option key={item.id} value={item.id}>{item.name} - Class {item.cls}</option>)}</select><button type="button" className="prediction-refresh" onClick={() => setStudentId(STUDENTS[(STUDENTS.findIndex((item) => item.id === student.id) + 1) % STUDENTS.length].id)}><Sparkles size={13} /> New Prediction</button></section><div className="prediction-grid"><div className="prediction-card prediction-gpa-card"><div className="prediction-card-head"><span className="prediction-icon violet"><TrendingUp size={15} /></span><div><h3>Predicted GPA</h3><p>{student.name} - Class {student.cls}</p></div></div><strong className="prediction-gpa" style={{ color: prediction.riskLevel === "Low Risk" ? "var(--cyan)" : "#ff6b6b" }}>{prediction.predictedGpa.toFixed(2)} <small>/ 10</small></strong><span className="prediction-caption">Predicted GPA</span><div className="prediction-rule" /><div className="prediction-risk-line"><span>Risk Level</span><strong>{prediction.riskLevel}</strong><b><ShieldCheck size={12} /> {100 - chance}% Safe</b></div></div><div className="prediction-card prediction-signals-card"><div className="prediction-card-head"><span className="prediction-icon cyan"><RadarIcon size={15} /></span><div><h3>Prediction signals</h3><p>Current indicators used for this forecast</p></div></div><div className="prediction-signals">{signals.map(([label, value]) => <div className="prediction-signal" key={label}><span>{label}</span><div className="prediction-signal-track"><i style={{ width: `${value}%` }} /></div><b>{value}%</b><em className="positive">{value >= 70 ? "Positive" : "Needs attention"}</em></div>)}</div></div><div className="prediction-card prediction-chance-card"><div className="prediction-card-head"><span className="prediction-icon cyan"><Target size={15} /></span><div><h3>Success probability</h3><p>Based on current performance</p></div></div><div className="prediction-ring" style={{ "--ring-progress": `${chance * 3.6}deg` }}><div><strong>{chance}%</strong><span>High Chance</span></div></div><div className="prediction-mini-stats"><span><strong>Top 20%</strong><small>Class Percentile</small></span><span><strong>↗ Improving</strong><small>Positive Trend</small></span></div></div><div className="prediction-recommendations"><div className="prediction-section-title"><span><Sparkles size={15} /> AI Recommendations</span><small>Personalized suggestions to improve performance</small></div><div className="recommendation-grid">{["Improve Study Consistency", "Focus on Assignments", "Enhance Lab Performance", "Manage Study Hours"].map((title) => <div className="recommendation-card" key={title}><span className="recommendation-icon cyan"><Check size={19} /></span><div><strong>{title}</strong><p>Personalized support action for {student.name}.</p><em className="cyan">Medium Impact</em></div></div>)}</div></div></div></div>;
}

// Legacy markup is retained for reference but is not part of the active route.
/* eslint-disable no-unused-vars */
function LegacyPredictionPage() {
  const [studentId, setStudentId] = useState(STUDENTS[0]?.id || "");
  const student = STUDENTS.find((item) => item.id === studentId) || STUDENTS[0];
  const prediction = predictStudent(student);
  const riskTone = prediction.riskLevel === "Low Risk" ? "var(--cyan)" : prediction.riskLevel === "Medium Risk" ? "var(--violet)" : "#ff6b6b";

  return (
    <div className="settings-page">
      <section className="hero-block">
        <span className="hero-kicker"><Activity size={12} /> AI performance prediction</span>
        <h1>Predict student <em>success.</em></h1>
        <p>Choose a student by name to view their projected GPA, current risk level, and the signals behind the prediction.</p>
      </section>

      <section className="settings-card" style={{ marginBottom: "18px" }}>
        <div className="settings-card-head">
          <span className="settings-card-icon"><Search size={16} /></span>
          <div><h3>Choose a student</h3><p>Prediction updates instantly when you select a name</p></div>
        </div>
        <label className="settings-field">
          <span>Student name</span>
          <select value={student.id} onChange={(event) => setStudentId(event.target.value)}>
            {STUDENTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </section>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-head"><span className="settings-card-icon"><TrendingUp size={16} /></span><div><h3>{student.name}</h3><p>{student.id} · Semester {student.cls}</p></div></div>
          <div className="kpi-value" style={{ color: riskTone }}>{prediction.predictedGpa.toFixed(2)} / 10</div>
          <div className="kpi-label">Predicted GPA</div>
          <div className="prediction-risk" style={{ color: riskTone, marginTop: "18px", fontWeight: 700 }}>{prediction.riskLevel}</div>
        </div>
        <div className="settings-card">
          <div className="settings-card-head"><span className="settings-card-icon"><RadarIcon size={16} /></span><div><h3>Prediction signals</h3><p>Current indicators used for this forecast</p></div></div>
          {["Attendance", "Assignments", "Participation"].map((metric) => {
            const value = metric === "Attendance" ? prediction.attendance : metric === "Assignments" ? prediction.assignments : prediction.participation;
            return <div className="subject-mini-row" key={metric} style={{ margin: "18px 0" }}><span style={{ minWidth: "105px" }}>{metric}</span><div className="subject-mini-track"><div className="subject-mini-fill" style={{ width: `${value}%` }} /></div><span className="subject-mini-value">{value}%</span></div>;
          })}
        </div>
        <div className="settings-card">
          <div className="settings-card-head"><span className="settings-card-icon"><AlertTriangle size={16} /></span><div><h3>Key factors</h3><p>Signals affecting the result</p></div></div>
          <ul className="feature-list">{prediction.factors.map((factor) => <li key={factor}><span className="feat-icon"><Info size={12} /></span>{factor}</li>)}</ul>
        </div>
        <div className="settings-card">
          <div className="settings-card-head"><span className="settings-card-icon"><Sparkles size={16} /></span><div><h3>Recommended actions</h3><p>Practical next steps for support</p></div></div>
          <ul className="feature-list">{prediction.recommendations.map((recommendation) => <li key={recommendation}><span className="feat-icon"><Check size={12} /></span>{recommendation}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
/* eslint-enable no-unused-vars */

const FAQS = [
  {
    question: "How often is student performance data synchronized?",
    answer: "Data is synchronized in near real-time as assessment scores and attendance logs are submitted by staff members. Batch processing updates predictive trend calculations every 24 hours.",
  },
  {
    question: "What should I do if a student record appears incomplete?",
    answer: "Ensure the student ID matches the institutional database. If grades are missing for specific terms, verify that subject assignments for that grade level (Primary, Middle, Secondary, Senior) are submitted.",
  },
  {
    question: "Who can access individual student risk indicators?",
    answer: "Access is strictly role-based. Teachers see students in their designated grade, while counselors and administrators maintain cohort-wide visibility under strict privacy compliance.",
  },
];

function SettingsPage({ user }) {
  const [username, setUsername] = useState(user?.name || user?.email?.split("@")[0] || "User");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");
  const savedMessageTimerRef = useRef(null);

  const [openFaq, setOpenFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(savedMessageTimerRef.current);
  }, []);

  useEffect(() => () => {
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
  }, [avatarUrl]);

  function showSavedMessage(message, duration = 3000) {
    window.clearTimeout(savedMessageTimerRef.current);
    setSavedMessage(message);
    savedMessageTimerRef.current = window.setTimeout(() => setSavedMessage(""), duration);
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      showSavedMessage("Profile photo uploaded successfully.");
    }
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    showSavedMessage("Account preferences updated successfully.");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showSavedMessage("Error: Passwords do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showSavedMessage("Password changed successfully.");
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const adminEmail = "administrator@learnova.ai";
    const subject = encodeURIComponent(`[Learnova Support Request] From ${username}`);
    const body = encodeURIComponent(
      `Support Inquiry Details:\n` +
      `----------------------------\n` +
      `User Name: ${username}\n` +
      `User Email: ${email}\n` +
      `Timestamp: ${new Date().toLocaleString()}\n\n` +
      `Query:\n${supportMessage}`
    );

    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    setSupportMessage("");
    showSavedMessage(`Opening email client to route query to system administrators (${adminEmail})...`, 4000);
  };

  return (
    <div className="settings-page">
      <section className="hero-block">
        <span className="hero-kicker">
          <Settings size={12} />
          Account & Portal Configurations
        </span>
        <h1>
          Manage your account <em>settings.</em>
        </h1>
        <p>
          Update your avatar, credentials, security settings, and alert options across your Learnova profile.
        </p>
      </section>

      {savedMessage ? (
        <div className="settings-toast">
          <Check size={14} />
          <span>{savedMessage}</span>
        </div>
      ) : null}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <User size={16} />
            </span>
            <div>
              <h3>Account Details</h3>
              <p>Change your avatar, public display username, and contact email</p>
            </div>
          </div>
          <form onSubmit={handleSaveAccount} className="settings-form">
            <div className="avatar-upload-wrap">
              <div className="avatar-preview">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User Avatar" />
                ) : (
                  <span className="avatar-fallback">{username.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="avatar-controls">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  Change Profile Picture
                </button>
                <p className="avatar-hint">Supports JPG, PNG or GIF up to 5MB</p>
              </div>
            </div>

            <label className="settings-field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label className="settings-field">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="settings-btn">
              Save Account Changes
            </button>
          </form>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <KeyRound size={16} />
            </span>
            <div>
              <h3>Password Change</h3>
              <p>Update your password regularly to keep student records secure</p>
            </div>
          </div>
          <form onSubmit={handlePasswordChange} className="settings-form">
            <label className="settings-field">
              <span>Current Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="settings-field">
              <span>New Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label className="settings-field">
              <span>Confirm New Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="settings-btn">
              Update Password
            </button>
          </form>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h3>Privacy & Security</h3>
              <p>Manage authentication controls and privacy permissions</p>
            </div>
          </div>
          <div className="settings-toggle-list">
            <div className="settings-toggle-item">
              <div>
                <strong>Two-Factor Authentication (2FA)</strong>
                <p>Require a verification code when logging into the platform</p>
              </div>
              <button
                type="button"
                className={`toggle-switch${twoFactor ? " active" : ""}`}
                onClick={() => setTwoFactor((prev) => !prev)}
              >
                <span className="toggle-slider" />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <Bell size={16} />
            </span>
            <div>
              <h3>Notification Preferences</h3>
              <p>Control early-warning alert notifications and digests</p>
            </div>
          </div>
          <div className="settings-toggle-list">
            <div className="settings-toggle-item">
              <div>
                <strong>Email Risk Digest</strong>
                <p>Receive immediate alerts when students drop into the critical risk band</p>
              </div>
              <button
                type="button"
                className={`toggle-switch${emailAlerts ? " active" : ""}`}
                onClick={() => setEmailAlerts((prev) => !prev)}
              >
                <span className="toggle-slider" />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card settings-card-wide">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <HelpCircle size={16} />
            </span>
            <div>
              <h3>Help & Support</h3>
              <p>Reach administrators via email, GitHub, or LinkedIn, or browse platform FAQs</p>
            </div>
          </div>

          <div className="support-wrapper">
            <div className="faq-section">
              <h4 className="support-subhead">Frequently Asked Questions</h4>
              <div className="faq-list">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="faq-item">
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      {isOpen ? <p className="faq-answer">{faq.answer}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="support-contact-section">
              <h4 className="support-subhead">Reach Out to Admins</h4>
              <div className="support-channels-list">
                {SUPPORT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <a
                      key={ch.id}
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-channel-card"
                    >
                      <span className="support-channel-icon">
                        <Icon size={16} />
                      </span>
                      <div>
                        <strong>{ch.label}</strong>
                        <p>{ch.hint}</p>
                      </div>
                      <ArrowRight size={14} className="support-channel-arrow" />
                    </a>
                  );
                })}
              </div>

              <h4 className="support-subhead" style={{ marginTop: 20 }}>Direct Message Admins</h4>
              <form onSubmit={handleSupportSubmit} className="settings-form">
                <label className="settings-field">
                  <span>Describe your query or issue</span>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed context for the administrative team..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="settings-btn">
                  <Mail size={14} style={{ marginRight: 6 }} />
                  Send Inquiry Email
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  const members = [
    {
      name: "Lucky Chaurasiya",
      github: "https://github.com/chaurasiyalucky241-cmd",
      linkedin: "https://www.linkedin.com/in/lucky-chaurasiya-97946336b",
    },
    {
      name: "Sahna Sharma",
      github: "https://github.com/sahna4352",
      linkedin: "https://www.linkedin.com/in/sahna-sharma-63b569399",
    },
    {
      name: "Rudrapratap Singh Rajpoot",
      github: "https://github.com/Iamrudrx",
      linkedin: "https://www.linkedin.com/in/rudrapratap-singh-rajpoot-8983723b6",
    },
  ];

  return (
    <div className="about-page">
      <section className="hero-block">
        <span className="hero-kicker">
          <Info size={12} />
          About Learnova
        </span>
        <h1>
          Reading the <em>signals</em> before the report card.
        </h1>
        <p>
          Learnova is an early-warning platform for schools. It brings attendance,
          coursework, assessments, and engagement data together into one view, so teachers,
          counselors, and administrators can spot a student drifting off track weeks before a
          report card would show it.
        </p>
      </section>

      <section className="about-grid">
        <div className="about-card">
          <span className="about-card-icon">
            <RadarIcon size={16} />
          </span>
          <h3>What it does</h3>
          <p>
            The platform continuously scores every student across every subject, from Semester 1
            through Semester 6, and rolls those scores up into semester and school-wide views.
            Sudden drops, slow declines, and subjects that consistently underperform are
            surfaced automatically rather than left for a teacher to notice by chance.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card-icon">
            <BarChart3 size={16} />
          </span>
          <h3>How it works</h3>
          <p>
            Term-by-term academic data feeds a set of models that track each student's
            trajectory relative to their own history, their classroom, and the wider cohort.
            The dashboard turns that into overall trends, subject-by-subject comparisons, and
            individual student profiles that update as new results come in.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card-icon">
            <ShieldCheck size={16} />
          </span>
          <h3>Who it's for</h3>
          <p>
            Teachers use it to catch a struggling student early in their own classroom.
            Counselors use it to prioritize outreach across a whole grade. Administrators use
            it to see which subjects or classes need more support, resourced with real data
            instead of anecdote.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card-icon">
            <Lock size={16} />
          </span>
          <h3>Built on trust</h3>
          <p>
            Student data belongs to the school and the family, not to us. Access is scoped by
            role, every view is auditable, and data handling follows applicable student
            privacy regulations. Learnova is meant to inform the adults supporting a
            student, never to replace their judgment.
          </p>
        </div>
      </section>

      <section className="about-mission">
        <h2>Our mission</h2>
        <p>
          Most academic risk is visible long before it becomes a crisis, it's just scattered
          across attendance logs, gradebooks, and hallway conversations that never quite
          connect. Learnova exists to connect them, so the right person can step in
          while there's still time for it to matter.
        </p>
      </section>

      <section className="member-section">
        <div className="member-section-head">
          <span className="hero-kicker">
            <Users size={12} />
            Member Details
          </span>
          <h2>Project members</h2>
          <p>Quick access to each contributor's GitHub and LinkedIn profiles.</p>
        </div>

        <div className="member-grid">
          {members.map((member) => (
            <article className="member-card" key={member.name}>
              <div className="member-avatar">
                <img className="member-avatar-image" src={`${member.github}.png?size=128`} alt={`${member.name} GitHub profile`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; }} />
                <span hidden aria-hidden="true">{member.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
              </div>
              <div className="member-content">
                <h3>{member.name}</h3>
                <a href={member.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={member.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function StudentSuccessApp({ onLogout, user }) {
  const [theme, setTheme] = useState(() => {
    try {
      return (
        window.localStorage.getItem(THEME_STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY) ||
        "midnight"
      );
    } catch {
      return "midnight";
    }
  });
  const [page, setPage] = useState("home");
  const [filters, setFilters] = useState({ cls: null, studentId: null, subject: null });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [predictionSemester, setPredictionSemester] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    getStudents(controller.signal)
      .then((students) => {
        if (!active) return;
        STUDENTS = students.map(toDashboardStudent);
        setLoadError("");
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (!active) return;
        setLoadError("Unable to connect to the backend.");
        setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [page]);

  useEffect(() => {
    const root = document.querySelector(".ssai-root");
    let idleTimer;

    const handleScroll = () => {
      if (!root) return;
      root.classList.add("is-scrolling");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => root.classList.remove("is-scrolling"), 140);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
      root?.classList.remove("is-scrolling");
    };
  }, []);

  useLayoutEffect(() => {
    if (page !== "prediction") return;
    document.querySelectorAll(".prediction-selector option").forEach((option) => {
      option.textContent = option.textContent.replace(/\s*-\s*Class\s+/g, " - Semester ");
    });
    document.querySelectorAll(".prediction-gpa-card p").forEach((label) => {
      label.textContent = label.textContent.replace(/\s*-\s*Class\s+/g, " - Semester ");
    });
  }, [page]);

  const { nodes, lines } = useMemo(() => {
    const width = 1000;
    const height = 700;
    const count = 28;

    const points = Array.from({ length: count }, (_, i) => ({
      x: rand(i + 101) * width,
      y: rand(i + 202) * height,
    }));

    const connections = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 140) {
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
      Math.floor(rand(1) * points.length),
      Math.floor(rand(2) * points.length),
      Math.floor(rand(3) * points.length),
    ]);

    return {
      nodes: points.map((point, index) => ({
        ...point,
        driftX: ((Math.sin(index + 11) + 1) / 2) * 18 - 9,
        driftY: ((Math.sin(index + 21) + 1) / 2) * 16 - 8,
        delay: (index % 6) * 0.35,
        signal: signalIndexes.has(index),
        alt: signalIndexes.has(index) && index % 2 !== 0,
      })),
      lines: connections.map((line, index) => ({
        ...line,
        delay: (index % 8) * 0.25,
      })),
    };
  }, []);

  function handleHomeSearch(nextFilters) {
    setFilters({ cls: nextFilters.cls ?? null, studentId: nextFilters.studentId ?? null, subject: nextFilters.subject ?? null });
    setPage("dashboard");
  }

  return (
    <div className={`ssai-root${mounted ? " page-enter" : ""}`} data-theme={theme}>
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
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            style={{ animationDelay: `${line.delay}s` }}
          />
        ))}
        {nodes.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={node.signal ? 4 : 2.2}
            className={node.signal ? `signal${node.alt ? " alt" : ""}` : "node"}
            style={{
              "--drift-x": `${node.driftX}px`,
              "--drift-y": `${node.driftY}px`,
              animationDelay: `${node.delay}s`,
            }}
          />
        ))}
      </svg>

      <div className="dash-shell">
        <div className="topbar">
          <div className="logo-area">
            <div className="logo-toggle" aria-label="Learnova">
              <BrandLogo state="signedIn" />
            </div>
            <div className="brand-title">Learn<span>ova</span></div>
          </div>

          <div className="topbar-actions">
            <NavBar active={page} onNavigate={setPage} />
            <div className="topbar-theme-slot">
              <ThemeStrip theme={theme} setTheme={setTheme} />
            </div>
            <LogoutButton onLogout={onLogout} />
          </div>
        </div>

        {isLoading ? <div className="empty-state">Loading students from the backend...</div> : null}
        {loadError ? <div className="empty-state">{loadError}<button type="button" onClick={() => window.location.reload()}>Retry</button></div> : null}
        {!isLoading && !loadError && !STUDENTS.length ? <div className="empty-state">No student data is available from the backend.</div> : null}
        {!isLoading && !loadError && STUDENTS.length > 0 && page === "home" ? <HomePage onSearch={handleHomeSearch} /> : null}
        {!isLoading && !loadError && STUDENTS.length > 0 && page === "dashboard" ? <DashboardPage filters={filters} setFilters={setFilters} /> : null}
        {!isLoading && !loadError && STUDENTS.length > 0 && page === "prediction" ? <div className="prediction-workspace"><label className="prediction-semester-filter"><span>Semester</span><select value={predictionSemester} onChange={(event) => setPredictionSemester(event.target.value)} aria-label="Filter prediction students by semester"><option value="">All semesters</option>{CLASSES.map((item) => <option key={item} value={item}>Semester {item}</option>)}</select></label><PredictionPage semester={predictionSemester} /></div> : null}
        {!isLoading && page === "settings" ? <SettingsPage user={user} /> : null}
        {!isLoading && page === "about" ? <AboutPage /> : null}
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

.ssai-root {
  --bg1: #07111d;
  --bg2: #13233a;
  --bg3: #1e3552;
  --bg4: #2e4b66;
  --bg5: #48b7d9;
  --ink: #f5f7fb;
  --ink-soft: #c8d2df;
  --ink-faint: #8e9ab0;
  --violet: #8a2be2;
  --cyan: #00d4ff;
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.13);
  --glass-strong: rgba(255, 255, 255, 0.1);
  --select-option-bg: #15263d;
  --select-option-color: #f8fafc;
  --node: rgba(233, 242, 255, 0.52);
  --orb-a: rgba(0, 212, 255, 0.16);
  --orb-b: rgba(138, 43, 226, 0.18);
  --orb-c: rgba(255, 255, 255, 0.08);

  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  min-height: 100vh;
  width: 100%;
  padding: 28px;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(150deg, var(--bg1) 0%, var(--bg2) 32%, var(--bg3) 58%, var(--bg4) 80%, var(--bg5) 100%);
  background-size: 180% 180%;
  animation: drift 26s ease-in-out infinite;
  color: var(--ink);
  transition: background 0.9s ease, color 0.45s ease;
  box-sizing: border-box;
}

.ssai-root.page-enter {
  animation:
    drift 26s ease-in-out infinite,
    pageEnter 0.68s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.ssai-root.is-scrolling,
.ssai-root.is-scrolling::before,
.ssai-root.is-scrolling .background-orbs,
.ssai-root.is-scrolling .orb,
.ssai-root.is-scrolling .constellation {
  animation-play-state: paused !important;
}

.ssai-root.is-scrolling *,
.ssai-root.is-scrolling *::before,
.ssai-root.is-scrolling *::after {
  transition: none !important;
}

.ssai-root.is-scrolling .panel,
.ssai-root.is-scrolling .topbar,
.ssai-root.is-scrolling .filter-bar,
.ssai-root.is-scrolling .search-card,
.ssai-root.is-scrolling .settings-card,
.ssai-root.is-scrolling .about-card,
.ssai-root.is-scrolling .member-section {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.ssai-root::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black, transparent 85%);
  animation: backgroundGrid 24s linear infinite;
}

@keyframes backgroundGrid {
  from { background-position: 0 0, 0 0; }
  to { background-position: 72px 72px, 72px 72px; }
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
  --select-option-bg: #0d2742;
  --select-option-color: #f8fafc;
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
  --select-option-bg: #fff5eb;
  --select-option-color: #3e1734;
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
  --select-option-bg: #111827;
  --select-option-color: #f4f7fb;
  --node: rgba(203, 213, 225, 0.42);
  --orb-a: rgba(56, 189, 248, 0.18);
  --orb-b: rgba(148, 163, 184, 0.16);
  --orb-c: rgba(255, 255, 255, 0.08);
}

.ssai-root select option {
  background-color: var(--select-option-bg);
  color: var(--select-option-color);
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
    fill 0.45s ease,
    stroke 0.45s ease;
}

.ssai-root h1,
.ssai-root h2,
.ssai-root h3,
.ssai-root h4 {
  font-family: "Space Grotesk", Inter, sans-serif;
}

.ssai-root,
.ssai-root button,
.ssai-root input,
.ssai-root select,
.ssai-root textarea {
  font-family: "Space Grotesk", Inter, sans-serif;
}

@keyframes drift {
  0%, 100% { background-position: 0% 30%; }
  50% { background-position: 100% 70%; }
}

@keyframes gentleFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -10px, 0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.55; r: 3.2; }
  50% { opacity: 1; r: 5.5; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
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
  filter: blur(30px);
  opacity: 0.6;
  animation: gentleFloat 16s ease-in-out infinite;
}

.orb-a { width: 22vw; height: 22vw; left: -6vw; top: 0vh; background: var(--orb-a); }
.orb-b { width: 26vw; height: 26vw; right: -8vw; bottom: 0vh; background: var(--orb-b); animation-delay: -4s; }
.orb-c { width: 16vw; height: 16vw; left: 40vw; bottom: -8vw; background: var(--orb-c); animation-delay: -8s; }

.constellation {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.45;
  width: 100%;
  height: 100%;
}

.constellation line {
  stroke: var(--node);
  stroke-width: 1;
  opacity: 0.32;
  animation: linePulse 8s ease-in-out infinite;
  transform-origin: center;
}

.constellation circle.node {
  fill: var(--node);
  animation: nodeDrift 8s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.constellation circle.signal {
  fill: var(--cyan);
  animation: pulse 2.8s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.constellation circle.signal.alt {
  fill: var(--violet);
  animation-delay: 1.1s;
}

@keyframes nodeDrift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(var(--drift-x, 0px), var(--drift-y, 0px), 0) scale(1.06); }
}

@keyframes linePulse {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.38; }
}

.dash-shell {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding-top: 4px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 18px;
  margin-bottom: 26px;
  border-radius: 18px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: rise 0.7s ease both;
  overflow: visible;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  min-width: 0;
}

.logo-toggle {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
}
.logo-toggle .brand-logo-image { width: 32px; height: 32px; object-fit: contain; border-radius: 11px; }
.logo-toggle:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }

.topbar-actions {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topbar-theme-slot {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.35);
  flex: none;
}

.brand-title { font-size: 14.5px; font-weight: 700; letter-spacing: -0.3px; white-space: nowrap; }
.brand-title span { color: var(--cyan); }
.brand-open .logo-icon { box-shadow: 0 6px 20px rgba(0, 212, 255, 0.34); }

.navbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.navbar-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--ink-faint);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}

.navbar-link:hover { color: var(--ink-soft); }

.navbar-link.active {
  color: var(--ink);
  background: var(--glass-strong);
  box-shadow: 0 0 0 1px var(--glass-border) inset;
}

.navbar-link.active svg { color: var(--cyan); }

.logout-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 27, 48, 0.82);
  color: var(--ink);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  flex: none;
}

.logout-trigger:hover {
  border-color: rgba(255, 128, 128, 0.45);
  color: #ff9a9a;
  transform: translateY(-1px);
}

.theme-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  box-shadow: none;
  overflow-x: auto;
  max-width: min(100%, 520px);
  white-space: nowrap;
}

.theme-strip-label {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-faint);
  font-weight: 800;
  flex: none;
}

.theme-strip-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.theme-strip-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex: none;
}

.theme-strip-item:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.05);
}

.theme-strip-item.active {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(111, 192, 255, 0.55);
  box-shadow: 0 0 0 1px rgba(111, 192, 255, 0.2) inset;
}

.theme-strip-item .theme-swatch {
  width: 16px;
  height: 16px;
}

.topbar-theme-slot .theme-strip {
  max-width: none;
}

@media (max-width: 980px) {
  .topbar {
    flex-wrap: wrap;
  }

  .topbar-actions {

@media (min-width: 961px) {
  .topbar { min-height: 76px; padding: 12px 18px; }
  .topbar-actions { display: grid; grid-template-columns: auto minmax(0, auto); grid-template-areas: "nav theme" "nav logout"; align-items: center; justify-content: end; column-gap: 10px; row-gap: 6px; }
  .topbar-actions .navbar { grid-area: nav; align-self: center; height: 48px; }
  .topbar-actions .topbar-theme-slot { grid-area: theme; align-self: center; }
  .topbar-actions .logout-trigger { grid-area: logout; justify-self: end; }
  .navbar-link { min-width: 82px; justify-content: center; padding-inline: 10px; font-size: 11.5px; }
  .theme-strip { gap: 5px; padding: 6px 8px; height: 48px; }
  .theme-strip-label { font-size: 10px; }
  .theme-strip-list { gap: 3px; }
  .theme-strip-item { justify-content: center; width: 86px; gap: 5px; padding: 6px 8px; font-size: 10.5px; }
  .theme-strip-item .theme-swatch { width: 14px; height: 14px; }
  .logout-trigger { padding: 8px 12px; font-size: 11.5px; }
}
    flex: none;
    justify-content: center;
    width: 100%;
  }

  .logo-area {
    width: 100%;
    justify-content: center;
  }
}

.theme-swatch { width: 12px; height: 12px; border-radius: 999px; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.12); flex: none; }
.theme-swatch[data-theme="midnight"] { background: linear-gradient(135deg, #8a2be2, #00d4ff); }
.theme-swatch[data-theme="aurora"] { background: linear-gradient(135deg, #22d3ee, #8b5cf6); }
.theme-swatch[data-theme="sunrise"] { background: linear-gradient(135deg, #f97316, #ef4444); }
.theme-swatch[data-theme="graphite"] { background: linear-gradient(135deg, #94a3b8, #38bdf8); }

.hero-block {
  max-width: 640px;
  margin: 20px 0 30px;
  animation: rise 0.75s ease both;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-block h1 { font-size: 34px; font-weight: 600; line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.5px; }
.hero-block h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ssai-root h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-block p { font-size: 14.5px; line-height: 1.65; color: var(--ink-soft); }

.search-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.search-card {
  padding: 20px;
  border-radius: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: rise 0.8s ease both;
}

.search-card-head { display: flex; align-items: center; gap: 12px; }

.search-card-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cyan);
  flex: none;
}

.search-card-head h3 { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.search-card-head p { font-size: 11.5px; color: var(--ink-faint); }

.search-input-wrap { position: relative; display: flex; align-items: center; }

.search-input-wrap input,
.search-card select {
  width: 100%;
  padding: 11px 36px 11px 14px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass-bg);
  color: var(--ink);
  font-size: 13.5px;
  outline: none;
  font-family: inherit;
}

.search-card select { padding: 11px 14px; cursor: pointer; }

.search-input-wrap input::placeholder { color: var(--ink-faint); }
.search-input-wrap input:focus,
.search-card select:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.16); }

.search-clear {
  position: absolute;
  right: 10px;
  border: none;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  display: flex;
}

.search-suggestions { 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  background: var(--select-option-bg);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--ink);
}

.search-suggestion:hover { background: var(--glass-strong); border-color: var(--glass-border); }
.search-suggestion-arrow { margin-left: auto; color: var(--ink-faint); flex: none; }

.search-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(100deg, var(--violet), var(--cyan));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  margin-top: auto;
}

.search-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.search-submit:not(:disabled):hover { transform: translateY(-1px); }

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.home-stats > div {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid var(--glass-border);
  text-align: center;
}

.home-stats strong { display: block; font-size: 22px; margin-bottom: 4px; }
.home-stats span { display: block; font-size: 11px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.08em; }

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 14px;
  animation: rise 0.7s ease both;
}

.dash-header-title h1 { font-size: clamp(25px, 3vw, 38px); font-weight: 800; letter-spacing: 0; margin-bottom: 6px; line-height: 1.05; }
.dash-header-title p { font-size: 13px; color: var(--ink-soft); max-width: 620px; line-height: 1.55; }

.dash-header-meta { display: flex; gap: 10px; flex-wrap: wrap; }

.term-pill, .cohort-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
  white-space: nowrap;
}

.dashboard-command-center {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: stretch;
  padding: 18px;
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1px solid rgba(0, 212, 255, 0.28);
  background:
    radial-gradient(circle at 12% 0%, rgba(0, 212, 255, 0.18), transparent 34%),
    radial-gradient(circle at 84% 20%, rgba(138, 43, 226, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.045));
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.2), inset 0 1px rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  position: relative;
  animation: rise 0.72s ease both;
}

.dashboard-command-center::after {
  content: "";
  position: absolute;
  inset: auto -8% -58% 32%;
  height: 140px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.22), rgba(138, 43, 226, 0.18), transparent);
  filter: blur(22px);
  pointer-events: none;
}

.command-main,
.command-metrics {
  position: relative;
  z-index: 1;
}

.command-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: var(--cyan);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.command-main h2 {
  margin: 0 0 8px;
  font-size: clamp(22px, 2.5vw, 34px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: 0;
}

.command-main p {
  max-width: 720px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
}

.command-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.command-metrics div {
  min-width: 0;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.075);
}

.command-metrics span,
.command-metrics small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-metrics span {
  color: var(--ink-faint);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.command-metrics strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 24px;
  line-height: 1;
  color: var(--ink);
}

.command-metrics small {
  color: var(--ink-soft);
  font-size: 11px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 14px;
  margin-bottom: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(0, 212, 255, 0.24);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16), inset 0 1px rgba(255, 255, 255, 0.1);
  animation: rise 0.75s ease both;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
}

.filter-field span { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); font-weight: 700; }

.filter-field select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.22);
  background: var(--glass-strong);
  color: var(--ink);
  font-size: 12.5px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.filter-field select:hover,
.filter-field select:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  transform: translateY(-1px);
  outline: none;
}

.filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.filter-reset:hover { border-color: var(--cyan); color: var(--ink); }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.kpi-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)),
    var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.14);
  animation: rise 0.75s ease both;
}

.kpi-card::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--cyan), var(--violet));
  opacity: 0.8;
}

.kpi-card:hover,
.panel:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 212, 255, 0.32);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.18);
}

.kpi-glow {
  position: absolute;
  right: -24px;
  bottom: -30px;
  width: 90px;
  height: 90px;
  border-radius: 999px;
  background: rgba(0, 212, 255, 0.12);
  filter: blur(6px);
  pointer-events: none;
}

.kpi-card-violet .kpi-glow { background: rgba(138, 43, 226, 0.16); }
.kpi-card-amber .kpi-glow { background: rgba(255, 180, 84, 0.13); }
.kpi-card-green .kpi-glow { background: rgba(74, 222, 128, 0.12); }

.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; min-height: 24px; }

.kpi-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  color: var(--cyan);
}

.kpi-icon-violet { color: var(--violet); }
.kpi-icon-amber { color: #ffb454; }
.kpi-icon-green { color: #4ade80; }

.kpi-delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
}

.kpi-delta.up { color: #4ade80; background: rgba(74, 222, 128, 0.12); }
.kpi-delta.down { color: #ff8080; background: rgba(255, 107, 107, 0.12); }

.kpi-value { position: relative; z-index: 1; font-size: 25px; font-weight: 800; letter-spacing: 0; margin-bottom: 5px; word-break: break-word; line-height: 1.12; }
.kpi-label { font-size: 12px; color: var(--ink-faint); font-weight: 500; }

.dash-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.panel {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 22px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.035)),
    var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: rise 0.8s ease both;
}

.panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  opacity: 0.8;
  pointer-events: none;
}

.panel-wide { grid-column: span 2; }

.student-highlight {
  border-color: rgba(138, 43, 226, 0.58);
  box-shadow: 0 0 0 1px rgba(138, 43, 226, 0.16), 0 20px 42px rgba(0, 0, 0, 0.18), 0 0 30px rgba(138, 43, 226, 0.13);
}

.student-highlight .panel-head h3 {
  color: var(--violet);
}

.panel-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.panel-head h3 { font-size: 15.5px; font-weight: 750; margin-bottom: 4px; }
.panel-head p { font-size: 12px; color: var(--ink-faint); line-height: 1.45; }

.panel-chart {
  width: 100%;
  min-width: 0;
  min-height: 0;
  contain: layout paint;
}

.panel-chart .recharts-responsive-container,
.panel-chart .recharts-wrapper,
.panel-chart .recharts-surface {
  min-width: 0 !important;
  min-height: 0 !important;
}
.panel-chart-tall { height: 278px; }
.panel-chart-donut { height: 215px; position: relative; }

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.donut-center strong { font-size: 22px; font-weight: 700; }
.donut-center span { font-size: 10.5px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.08em; }

.donut-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }

.legend-row { display: flex; gap: 18px; margin-top: 12px; justify-content: center; flex-wrap: wrap; }

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  color: var(--ink-soft);
  font-weight: 500;
}

.legend-dot { width: 9px; height: 9px; border-radius: 999px; flex: none; }
.legend-dot-dashed { border-radius: 2px; }

.panel-footnote {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
  font-size: 12px;
  color: #ff8f6b;
}

.chart-tooltip {
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 8px 11px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-size: 12px;
  color: var(--ink);
  min-width: 130px;
}

.chart-tooltip-label { font-size: 10.5px; color: var(--ink-faint); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.08em; }

.chart-tooltip-row { display: flex; align-items: center; gap: 7px; padding: 2px 0; }
.chart-tooltip-dot { width: 8px; height: 8px; border-radius: 999px; flex: none; }
.chart-tooltip-name { color: var(--ink-soft); flex: 1; }
.chart-tooltip-value { font-weight: 700; }

.subject-mini-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.subject-mini-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--glass-strong);
  overflow: hidden;
  min-width: 60px;
}
.subject-mini-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--violet), var(--cyan)); }
.subject-mini-value { font-size: 12px; font-weight: 700; min-width: 30px; text-align: right; }

.watchlist { display: flex; flex-direction: column; gap: 6px; }

.watchlist-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 0.8fr;
  gap: 12px;
  align-items: center;
  padding: 12px 10px;
  border: 1px solid transparent;
  font-size: 12.5px;
}

.watchlist-row-btn {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  text-align: left;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.watchlist-row-btn:hover { background: var(--glass-strong); border-color: rgba(0, 212, 255, 0.24); transform: translateX(3px); }

.watchlist-row:last-child { border-bottom: none; }

.watchlist-head {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  font-weight: 700;
  padding-bottom: 10px;
  background: transparent;
  border-bottom: 1px solid var(--glass-border);
}

.watchlist-student { display: flex; align-items: center; gap: 10px; }

.watchlist-avatar {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(138, 43, 226, 0.18));
  border: 1px solid rgba(0, 212, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--cyan);
  flex: none;
}

.watchlist-name { display: block; font-weight: 600; color: var(--ink); }
.watchlist-id { display: block; font-size: 10.5px; color: var(--ink-faint); margin-top: 1px; }
.watchlist-subject { color: var(--ink-soft); }

.watchlist-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  justify-self: start;
}

.watchlist-trend.up { color: #4ade80; }
.watchlist-trend.down { color: #ff8080; }

.prediction-workspace { display: flex; flex-direction: column; gap: 8px; }
.prediction-page { animation: rise 0.7s ease both; }
.prediction-semester-filter { display: flex; align-items: center; gap: 10px; width: fit-content; padding: 9px 12px; border: 1px solid rgba(0, 212, 255, 0.24); border-radius: 10px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.035)); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12); color: var(--ink-soft); font-size: 11px; }
.prediction-semester-filter span { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); }
.prediction-semester-filter select { padding: 7px 10px; border: 1px solid rgba(0, 212, 255, 0.22); border-radius: 7px; background: rgba(3, 12, 33, 0.85); color: var(--ink); font: inherit; cursor: pointer; }
.prediction-hero { position: relative; margin: 2px 0 16px; max-width: 620px; }
.prediction-mascot { position: absolute; top: 0; right: 12px; display: grid; place-items: center; width: 48px; height: 48px; color: #ffbd58; border: 1px solid rgba(255, 189, 88, 0.35); border-radius: 14px 14px 14px 5px; background: linear-gradient(145deg, rgba(255, 189, 88, 0.18), rgba(138, 43, 226, 0.18)); box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2); transform: rotate(5deg); animation: mascotFloat 4s ease-in-out infinite; }
.prediction-mascot::after { content: ""; position: absolute; right: 5px; bottom: -5px; width: 9px; height: 9px; border-right: 1px solid rgba(255, 189, 88, 0.35); border-bottom: 1px solid rgba(255, 189, 88, 0.35); background: rgba(83, 46, 106, 0.8); transform: skewY(35deg); }
@keyframes mascotFloat { 0%, 100% { transform: translateY(0) rotate(5deg); } 50% { transform: translateY(-7px) rotate(-3deg); } }
.prediction-hero h1 { font-size: 27px; line-height: 1.12; margin: 5px 0 8px; }
.prediction-hero h1 em { font-style: normal; background: linear-gradient(100deg, var(--cyan), var(--violet)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.prediction-hero p { color: var(--ink-soft); font-size: 11.5px; line-height: 1.45; }
.prediction-selector { display: grid; grid-template-columns: auto minmax(150px, 1fr) minmax(220px, 1.2fr) auto; align-items: center; gap: 12px; padding: 9px 14px; margin-bottom: 10px; border: 1px solid var(--glass-border); border-radius: 11px; background: rgba(255, 255, 255, 0.045); }
.prediction-selector-icon, .prediction-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 7px; color: var(--cyan); background: rgba(0, 212, 255, 0.08); border: 1px solid rgba(0, 212, 255, 0.17); }
.prediction-selector strong, .prediction-selector small { display: block; }
.prediction-selector strong { font-size: 11px; }
.prediction-selector small { margin-top: 2px; color: var(--ink-faint); font-size: 9px; }
.prediction-selector select { width: 100%; padding: 8px 12px; color: var(--ink); background: rgba(3, 12, 33, 0.85); border: 1px solid var(--glass-border); border-radius: 7px; font: inherit; font-size: 10px; }
.prediction-refresh, .prediction-reset, .prediction-generate { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--glass-border); border-radius: 7px; padding: 8px 13px; color: var(--ink-soft); background: transparent; font: inherit; font-size: 9px; cursor: pointer; white-space: nowrap; }
.prediction-refresh:hover, .prediction-reset:hover { border-color: var(--violet); color: var(--ink); }
.prediction-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 8px; }
.prediction-card { min-width: 0; padding: 11px 12px; border: 1px solid var(--glass-border); border-radius: 9px; background: rgba(4, 17, 43, 0.7); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08); }
.prediction-card-head { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
.prediction-card-head h3 { margin: 0 0 2px; font-size: 10.5px; font-weight: 600; }
.prediction-card-head p { color: var(--ink-faint); font-size: 8px; }
.prediction-icon { flex: none; width: 24px; height: 24px; }
.prediction-icon.violet { color: #b66bff; background: rgba(138, 43, 226, 0.14); border-color: rgba(138, 43, 226, 0.25); }
.prediction-gpa { display: block; margin-top: 14px; font-size: 24px; line-height: 1; }
.prediction-gpa small { font-size: 12px; color: var(--ink-faint); }
.prediction-caption { display: block; margin-top: 5px; color: var(--ink-faint); font-size: 8px; }
.prediction-rule { height: 1px; margin: 14px 0 9px; background: var(--glass-border); }
.prediction-risk-line { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 7px; font-size: 9px; color: var(--ink-faint); }
.prediction-risk-line strong { font-size: 10px; }
.prediction-risk-line b { display: inline-flex; align-items: center; gap: 3px; padding: 4px 6px; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 6px; color: #55d9b2; font-size: 8px; font-weight: 600; }
.prediction-signals { display: grid; gap: 8px; }
.prediction-signal { display: grid; grid-template-columns: 75px minmax(45px, 1fr) 27px 76px; align-items: center; gap: 5px; color: var(--ink-soft); font-size: 8px; }
.prediction-signal-track { height: 4px; overflow: hidden; border-radius: 5px; background: rgba(255, 255, 255, 0.08); }
.prediction-signal-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--violet), var(--cyan)); }
.prediction-signal b { color: var(--ink-soft); text-align: right; font-size: 8px; }
.prediction-signal em, .factor-table em, .recommendation-card em { font-style: normal; font-size: 7px; }
.positive { color: #43ddb0; }
.medium { color: #ffbd58; }
.attention { color: #ff6580; }
.prediction-ring, .distribution-ring { position: relative; display: grid; place-items: center; width: 72px; height: 72px; margin: 3px auto 8px; border-radius: 50%; background: conic-gradient(var(--cyan) 0 var(--ring-progress, 306deg), var(--violet) var(--ring-progress, 306deg) 360deg); }
.prediction-ring::before, .distribution-ring::before { content: ""; position: absolute; width: 56px; height: 56px; border-radius: 50%; background: #07152f; }
.prediction-ring > div, .distribution-ring > * { position: relative; z-index: 1; text-align: center; }
.prediction-ring strong, .distribution-ring strong { display: block; font-size: 15px; }
.prediction-ring span, .distribution-ring span { display: block; color: var(--ink-faint); font-size: 7px; }
.prediction-mini-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.prediction-mini-stats span { padding: 6px; border: 1px solid rgba(255,255,255,.06); border-radius: 6px; }
.prediction-mini-stats strong, .prediction-mini-stats small { display: block; font-size: 8px; }
.prediction-mini-stats strong { color: var(--cyan); }
.prediction-mini-stats small { margin-top: 2px; color: var(--ink-faint); font-size: 7px; }
.prediction-factors-card, .prediction-distribution-card, .prediction-risk-card { min-height: 153px; }
.factor-table { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; font-size: 8px; }
.factor-table > span { padding-bottom: 3px; color: var(--ink-faint); border-bottom: 1px solid var(--glass-border); font-size: 7px; }
.factor-table b { color: var(--ink-soft); font-weight: 500; }
.factor-table em { text-align: left; }
.factor-table em small { margin-left: 4px; font-size: 7px; }
.distribution-content { display: flex; align-items: center; justify-content: space-around; gap: 8px; }
.distribution-ring { --ring-progress: 223deg; width: 73px; height: 73px; margin: 2px 0; background: conic-gradient(#00d4ff 0 62%, #7040da 62% 90%, #d34e77 90% 100%); }
.distribution-legend { display: grid; gap: 7px; min-width: 0; }
.distribution-legend span { display: grid; grid-template-columns: 8px 1fr auto; gap: 5px; align-items: center; color: var(--ink-faint); font-size: 7px; white-space: nowrap; }
.distribution-legend i { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); }
.distribution-legend i.medium { background: #7040da; }
.distribution-legend i.low { background: #d34e77; }
.distribution-legend b { color: var(--ink-soft); }
.risk-detail-title { display: block; margin: 17px 0 13px; font-size: 14px; }
.risk-scale { position: relative; height: 4px; margin: 0 0 13px; border-radius: 4px; background: linear-gradient(90deg, #24d9b2, #ffbd58 55%, #ff5479); }
.risk-scale i { position: absolute; top: -4px; width: 2px; height: 12px; background: #fff; box-shadow: 0 0 4px rgba(255,255,255,.8); }
.risk-detail-copy { padding: 8px; border: 1px solid rgba(255,255,255,.05); border-radius: 5px; color: var(--ink-faint); font-size: 8px; line-height: 1.4; }
.prediction-recommendations { grid-column: span 3; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 9px; background: rgba(4, 17, 43, 0.7); }
.prediction-section-title { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.prediction-section-title span { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; }
.prediction-section-title small { color: var(--ink-faint); font-size: 8px; }
.recommendation-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.recommendation-card { display: flex; gap: 8px; padding: 7px; border: 1px solid rgba(255,255,255,.06); border-radius: 6px; }
.recommendation-icon { display: grid; place-items: center; width: 28px; height: 28px; flex: none; border-radius: 7px; }
.recommendation-icon.green { color: #32daa7; background: rgba(50,218,167,.12); }
.recommendation-icon.cyan { color: var(--cyan); background: rgba(0,212,255,.12); }
.recommendation-icon.amber { color: #ffb454; background: rgba(255,180,84,.12); }
.recommendation-icon.violet { color: #be7cff; background: rgba(138,43,226,.12); }
.recommendation-card strong { display: block; font-size: 8px; }
.recommendation-card p { margin: 3px 0 5px; color: var(--ink-faint); font-size: 7px; line-height: 1.3; }
.recommendation-card em { padding: 2px 5px; border-radius: 5px; background: rgba(255,255,255,.06); }
.prediction-actions { display: grid; grid-template-columns: 1fr 1fr; grid-column: span 3; gap: 10px; }
.prediction-reset { width: 100%; }
.prediction-generate { width: 100%; color: #fff; border-color: transparent; background: linear-gradient(100deg, var(--violet), var(--cyan)); }

.ssai-root[data-theme="sunrise"] .prediction-card,
.ssai-root[data-theme="sunrise"] .prediction-recommendations {
  background: rgba(255, 255, 255, 0.62);
  border-color: rgba(62, 23, 52, 0.16);
  box-shadow: 0 12px 30px rgba(126, 55, 40, 0.1);
}
.ssai-root[data-theme="sunrise"] .prediction-selector select {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(62, 23, 52, 0.18);
}
.ssai-root[data-theme="sunrise"] .prediction-mini-stats span,
.ssai-root[data-theme="sunrise"] .recommendation-card,
.ssai-root[data-theme="sunrise"] .risk-detail-copy {
  border-color: rgba(62, 23, 52, 0.12);
  background: rgba(255, 255, 255, 0.28);
}
.ssai-root[data-theme="sunrise"] .prediction-ring::before,
.ssai-root[data-theme="sunrise"] .distribution-ring::before {
  background: #fff4eb;
}
.ssai-root[data-theme="sunrise"] .logout-trigger {
  background: #3e1734;
  border-color: rgba(62, 23, 52, 0.35);
  color: #fff7f1;
}
.ssai-root[data-theme="sunrise"] .logout-trigger svg { color: #ff8a4c; }
.ssai-root[data-theme="sunrise"] .logout-trigger:hover {
  background: #522044;
  border-color: #ef7650;
  color: #fff;
}
.ssai-root[data-theme="sunrise"] .prediction-mascot {
  color: #e85d3f;
  border-color: rgba(232, 93, 63, 0.5);
  background: linear-gradient(145deg, rgba(255, 209, 157, 0.92), rgba(255, 143, 126, 0.78));
  box-shadow: 0 10px 24px rgba(179, 74, 59, 0.25);
}
.ssai-root[data-theme="sunrise"] .prediction-mascot::after {
  border-color: rgba(126, 48, 62, 0.55);
  background: #9b4860;
}

.settings-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  animation: rise 0.4s ease both;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.settings-card {
  padding: 22px;
  border-radius: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  animation: rise 0.8s ease both;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.settings-card-wide {
  grid-column: span 2;
}

.settings-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cyan);
  flex: none;
}

.settings-card-head h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.settings-card-head p {
  font-size: 12px;
  color: var(--ink-faint);
}

.avatar-upload-wrap {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.avatar-preview {
  width: 76px;
  height: 76px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.28), rgba(56, 189, 248, 0.2));
  border: 2px solid rgba(56, 189, 248, 0.28);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: none;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyan);
}

.avatar-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.avatar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  width: fit-content;
}

.avatar-btn:hover {
  border-color: var(--cyan);
  color: var(--cyan);
  transform: translateY(-1px);
}

.avatar-hint {
  font-size: 11px;
  color: var(--ink-faint);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.settings-field span {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  font-weight: 700;
}

.settings-field input,
.settings-field textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass-strong);
  color: var(--ink);
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.settings-field textarea {
  resize: vertical;
}

.settings-field input:focus,
.settings-field textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.16);
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(100deg, var(--violet), var(--cyan));
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin-top: 6px;
  align-self: flex-start;
}

.settings-btn:hover {
  transform: translateY(-1px);
}

.settings-toggle-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}

.settings-toggle-item strong {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 2px;
}

.settings-toggle-item p {
  font-size: 12px;
  color: var(--ink-faint);
  line-height: 1.4;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  position: relative;
  cursor: pointer;
  flex: none;
  transition: background-color 0.25s ease;
}

.toggle-switch.active {
  background: linear-gradient(100deg, var(--violet), var(--cyan));
  border-color: transparent;
}

.toggle-slider {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

.support-wrapper {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 20px;
  margin-top: 6px;
}

.support-subhead {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-strong);
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.faq-question:hover {
  color: var(--cyan);
}

.faq-answer {
  padding: 0 14px 12px 14px;
  font-size: 12px;
  color: var(--ink-faint);
  line-height: 1.55;
}

.support-channels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--ink);
  text-decoration: none;
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.support-channel-card:hover {
  border-color: var(--cyan);
  transform: translateY(-2px);
}

.support-channel-card strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.support-channel-card p {
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 1px;
}

.support-channel-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cyan);
  flex: none;
}

.support-channel-arrow {
  margin-left: auto;
  color: var(--ink-faint);
  flex: none;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.about-card {
  padding: 22px;
  border-radius: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  animation: rise 0.8s ease both;
}

.about-card-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cyan);
  margin-bottom: 14px;
}

.about-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.about-card p { font-size: 13px; line-height: 1.7; color: var(--ink-soft); }

.about-mission {
  padding: 26px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.12), rgba(0, 212, 255, 0.08));
  border: 1px solid var(--glass-border);
  animation: rise 0.85s ease both;
}

.about-mission h2 { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
.about-mission p { font-size: 13.5px; line-height: 1.75; color: var(--ink-soft); max-width: 720px; }

.member-section {
  margin-top: 18px;
  padding: 26px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  animation: rise 0.9s ease both;
}

.member-section-head {
  margin-bottom: 18px;
}

.member-section-head h2 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 6px;
}

.member-section-head p {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--ink-soft);
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.member-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  align-items: flex-start;
}

.member-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.04em;
  flex: none;
  overflow: hidden;
}

.member-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.member-avatar span {
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.member-content {
  min-width: 0;
}

.member-content h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--ink);
}

.member-content a {
  display: block;
  margin-top: 6px;
  color: var(--cyan);
  text-decoration: none;
  font-size: 12.5px;
  word-break: break-word;
}

.member-content a:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .ssai-root, .ssai-root::before, .orb, .kpi-card, .panel, .topbar, .dash-header, .theme-menu, .hero-block, .search-card, .about-card, .about-mission, .settings-card, .member-section, .prediction-mascot, .constellation line, .constellation circle.node, .constellation circle.signal { animation: none !important; transition: none !important; }
  .ssai-root *, .ssai-root *::before, .ssai-root *::after { transition: none !important; }
}

@media (max-width: 960px) {
  .ssai-root { padding: 16px; }
  .topbar { min-height: 76px; padding: 12px 18px; gap: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; }
  .logo-area { padding-right: 22px; border-right: 1px solid var(--glass-border); }
  .topbar-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; justify-content: stretch; gap: 14px; min-width: 0; }
  .topbar-actions .navbar { position: relative; justify-self: center; height: 48px; }
  .topbar-actions .navbar::before { content: ""; position: absolute; left: -8px; top: 8px; height: 32px; border-left: 1px solid var(--glass-border); }
  .topbar-actions .topbar-theme-slot { align-self: center; padding-left: 14px; border-left: 1px solid var(--glass-border); }
  .topbar-actions .logout-trigger { position: relative; justify-self: end; margin-left: 2px; padding-left: 16px; }
  .topbar-actions .logout-trigger::before { content: ""; position: absolute; left: 0; top: 5px; height: 24px; border-left: 1px solid var(--glass-border); }
  .navbar-link { padding-inline: 10px; font-size: 11.5px; }
  .theme-strip { gap: 5px; padding: 6px 8px; height: 48px; }
  .panel-wide { grid-column: span 1; }
  .watchlist-row { grid-template-columns: 1.4fr 1fr 0.9fr; }
  .watchlist-trend { display: none; }
  .dashboard-command-center { grid-template-columns: 1fr; }
  .command-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .search-grid { grid-template-columns: 1fr; }
  .settings-grid { grid-template-columns: 1fr; }
  .settings-card-wide { grid-column: span 1; }
  .support-wrapper { grid-template-columns: 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  .member-grid { grid-template-columns: 1fr; }
  .hero-block h1 { font-size: 27px; }
}

@media (max-width: 720px) {
  .topbar { flex-wrap: wrap; }
  .logo-area { width: 100%; justify-content: center; }
  .topbar-actions { width: 100%; justify-content: center; }
  .navbar { order: 3; width: 100%; justify-content: space-between; }
  .navbar-link { flex: 1; justify-content: center; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-field { min-width: 0; }
}

@media (max-width: 560px) {
  .prediction-grid { grid-template-columns: 1fr; }
  .prediction-recommendations, .prediction-actions { grid-column: span 1; }
  .recommendation-grid { grid-template-columns: 1fr; }
  .prediction-selector { grid-template-columns: auto 1fr; padding: 9px; }
  .prediction-selector select, .prediction-refresh { grid-column: span 2; }
  .prediction-signal { grid-template-columns: 78px minmax(35px, 1fr) 27px; }
  .prediction-signal em { display: none; }
  .kpi-grid { grid-template-columns: 1fr; }
  .dash-header-meta { gap: 8px; }
  .navbar-link span, .navbar-link { font-size: 11.5px; padding: 8px 8px; }
  .home-stats { grid-template-columns: 1fr; }
  .command-metrics { grid-template-columns: 1fr; }
}

@media (min-width: 561px) and (max-width: 960px) {
  .dash-shell {
    padding-top: 0;
  }

  .topbar {
    padding: 12px 16px;
  }

  .topbar-actions {
    gap: 8px;
  }

  .navbar-link {
    padding-inline: 11px;
  }

  .theme-strip {
    max-width: 100%;
  }
}

@media (max-width: 720px) {
  .ssai-root {
    padding: 10px;
  }

  .topbar {
    gap: 12px;
    padding: 12px;
    margin-bottom: 18px;
    border-radius: 14px;
  }

  .topbar-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    width: 100%;
    align-items: center;
  }

  .navbar {
    min-width: 0;
    overflow-x: auto;
    justify-content: flex-start;
    scrollbar-width: none;
  }

  .navbar::-webkit-scrollbar {
    display: none;
  }

  .navbar-link {
    flex: 0 0 auto;
    padding-inline: 10px;
  }

  .topbar-theme-slot {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
  }

  .theme-strip {
    width: 100%;
    justify-content: flex-start;
    max-width: none;
  }

  .theme-strip-label {
    display: none;
  }

  .logout-trigger {
    padding-inline: 10px;
  }

  .logout-trigger svg {
    display: none;
  }

  .panel,
  .settings-card,
  .about-card,
  .member-section {
    padding: 16px;
    border-radius: 16px;
  }

  .panel-head {
    gap: 10px;
    flex-wrap: wrap;
  }

  .panel-chart-tall {
    height: 240px;
  }

  .watchlist {
    overflow-x: auto;
  }

  .watchlist-row {
    min-width: 430px;
  }

  .hero-block h1 {
    font-size: clamp(25px, 7vw, 32px);
  }

  .member-card {
    align-items: center;
  }
}

@media (max-width: 560px) {
  .logo-area {
    justify-content: flex-start;
  }

  .brand-title {
    font-size: 13px;
  }

  .topbar-actions {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .navbar-link {
    gap: 5px;
    font-size: 10.5px;
    padding-inline: 8px;
  }

  .navbar-link svg {
    width: 14px;
    height: 14px;
  }

  .theme-strip {
    padding: 5px 6px;
  }

  .theme-strip-item {
    gap: 5px;
    padding: 6px 8px;
    font-size: 11px;
  }

  .dash-header,
  .hero-block {
    padding-inline: 4px;
  }

  .filter-bar {
    gap: 10px;
    padding: 12px;
  }

  .filter-field select,
  .filter-field input,
  .filter-reset {
    width: 100%;
  }

  .panel-chart-tall {
    height: 220px;
  }

  .panel-chart-donut {
    height: 190px;
  }

  .support-channel-card p {
    overflow-wrap: anywhere;
  }
}

.home-page,
.dashboard-page,
.prediction-page,
.settings-page,
.about-page {
  width: 100%;
  max-width: 1240px;
  margin-inline: auto;
}

.home-page,
.dashboard-page,
.prediction-page,
.settings-page,
.about-page {
  padding-bottom: clamp(18px, 3vw, 34px);
}

@media (min-width: 961px) {
  .ssai-root { padding: clamp(16px, 2.2vw, 28px); }
  .dash-shell { max-width: 1600px; }
  .topbar { display: flex; flex-wrap: nowrap; align-items: center; gap: 0; min-height: 76px; padding: 12px 18px; }
  .logo-area { flex: 0 0 auto; padding-right: 22px; border-right: 1px solid var(--glass-border); }
  .topbar-actions { display: flex; flex: 1 1 auto; flex-wrap: nowrap; align-items: center; justify-content: flex-start; gap: 14px; min-width: 0; }
  .topbar-actions .navbar { position: relative; flex: 0 0 auto; height: 48px; margin-left: 14px; }
  .topbar-actions .navbar::before { display: none; }
  .topbar-actions .topbar-theme-slot { flex: 0 1 auto; align-self: center; min-width: 0; padding-left: 14px; border-left: 1px solid var(--glass-border); }
  .topbar-actions .logout-trigger { position: relative; flex: 0 0 auto; margin-left: auto; padding-left: 16px; }
  .topbar-actions .logout-trigger::before { content: ""; position: absolute; left: 0; top: 5px; height: 24px; border-left: 1px solid var(--glass-border); }
  .topbar { margin-bottom: clamp(18px, 2vw, 26px); }
}

@media (max-width: 720px) {
  .ssai-root { padding: 10px; }
  .dash-shell { padding-top: 0; }
  .home-page, .dashboard-page, .prediction-page, .settings-page, .about-page { padding-bottom: 18px; }
  .prediction-mascot { right: 2px; width: 40px; height: 40px; }
}

@media (min-width: 961px) {
  .prediction-hero { max-width: 760px; margin-bottom: 22px; }
  .prediction-hero h1 { font-size: 34px; }
  .prediction-hero p { font-size: 14px; }
  .prediction-selector { gap: 15px; padding: 13px 18px; margin-bottom: 14px; }
  .prediction-selector-icon { width: 34px; height: 34px; }
  .prediction-selector strong { font-size: 13px; }
  .prediction-selector small { font-size: 10px; }
  .prediction-selector select { padding: 11px 14px; font-size: 12px; }
  .prediction-refresh { padding: 10px 15px; font-size: 11px; }
  .prediction-grid { gap: 12px; }
  .prediction-card { padding: 16px 17px; border-radius: 12px; }
  .prediction-card-head { gap: 11px; margin-bottom: 14px; }
  .prediction-icon { width: 31px; height: 31px; }
  .prediction-card-head h3 { font-size: 13px; }
  .prediction-card-head p { font-size: 10px; }
  .prediction-gpa { margin-top: 20px; font-size: 31px; }
  .prediction-gpa small { font-size: 15px; }
  .prediction-caption { font-size: 10px; }
  .prediction-rule { margin: 19px 0 13px; }
  .prediction-risk-line { font-size: 11px; }
  .prediction-risk-line strong { font-size: 13px; }
  .prediction-signal { grid-template-columns: 92px minmax(65px, 1fr) 34px 90px; gap: 8px; font-size: 10px; }
  .prediction-signal-track { height: 5px; }
  .prediction-signal b { font-size: 10px; }
  .prediction-signal em { font-size: 9px; }
  .prediction-ring, .distribution-ring { width: 88px; height: 88px; }
  .prediction-ring::before, .distribution-ring::before { width: 68px; height: 68px; }
  .prediction-ring strong, .distribution-ring strong { font-size: 19px; }
  .prediction-ring span, .distribution-ring span { font-size: 9px; }
  .prediction-mini-stats strong { font-size: 10px; }
  .prediction-mini-stats small { font-size: 9px; }
  .prediction-factors-card, .prediction-distribution-card, .prediction-risk-card { min-height: 188px; }
  .factor-table { font-size: 10px; gap: 8px 14px; }
  .factor-table > span { font-size: 9px; }
  .factor-table em, .factor-table em small { font-size: 9px; }
  .prediction-section-title span { font-size: 13px; }
  .prediction-section-title small { font-size: 10px; }
  .recommendation-card { padding: 10px; gap: 11px; }
  .recommendation-icon { width: 36px; height: 36px; }
  .recommendation-card strong { font-size: 10px; }
  .recommendation-card p { font-size: 9px; }
  .recommendation-card em { font-size: 8px; }
}

.ssai-root[data-theme="sunrise"] .topbar,
.ssai-root[data-theme="sunrise"] .navbar,
.ssai-root[data-theme="sunrise"] .theme-strip,
.ssai-root[data-theme="sunrise"] .filter-bar,
.ssai-root[data-theme="sunrise"] .search-card,
.ssai-root[data-theme="sunrise"] .kpi-card,
.ssai-root[data-theme="sunrise"] .panel,
.ssai-root[data-theme="sunrise"] .settings-card,
.ssai-root[data-theme="sunrise"] .about-card,
.ssai-root[data-theme="sunrise"] .about-mission,
.ssai-root[data-theme="sunrise"] .member-section {
  background: rgba(255, 255, 255, 0.64);
  border-color: rgba(62, 23, 52, 0.16);
  box-shadow: 0 12px 30px rgba(126, 55, 40, 0.08);
}
.ssai-root[data-theme="sunrise"] .navbar-link { color: #76576b; }
.ssai-root[data-theme="sunrise"] .navbar-link:hover,
.ssai-root[data-theme="sunrise"] .navbar-link.active { color: #3e1734; }
.ssai-root[data-theme="sunrise"] .navbar-link.active,
.ssai-root[data-theme="sunrise"] .theme-strip-item.active { background: rgba(255, 255, 255, 0.72); }
.ssai-root[data-theme="sunrise"] .theme-strip-item { color: #76576b; }
.ssai-root[data-theme="sunrise"] .theme-strip-item:hover { color: #3e1734; background: rgba(255, 255, 255, 0.5); }
.ssai-root[data-theme="sunrise"] .theme-strip-item.active { border-color: rgba(239, 68, 68, 0.55); }
.ssai-root[data-theme="sunrise"] .search-input-wrap input,
.ssai-root[data-theme="sunrise"] .search-card select,
.ssai-root[data-theme="sunrise"] .filter-field select {
  color: #3e1734;
  background: rgba(255, 255, 255, 0.74);
  border-color: rgba(62, 23, 52, 0.16);
}
.ssai-root[data-theme="sunrise"] .subject-mini-track,
.ssai-root[data-theme="sunrise"] .prediction-signal-track { background: rgba(62, 23, 52, 0.12); }
.ssai-root[data-theme="sunrise"] .member-content a { color: #c94f32; }
`;
