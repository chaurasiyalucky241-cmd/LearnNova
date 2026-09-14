const API_BASE_URLS = [
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_URL,
  "/api",
].filter(Boolean);

async function request(path, signal) {
  let lastError;
  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, { signal });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function post(path, body) {
  let lastError;
  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `API request failed: ${response.status}`);
      return result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function loginUser(email, password) {
  return post("/auth/login", { email, password });
}

export function registerUser(name, email, password, role) {
  return post("/auth/register", { name, email, password, role });
}

export function getStudents(signal) {
  return request("/students/?limit=2000", signal);
}

export function getDashboardMetrics() {
  return request("/analytics/dashboard");
}

export function getPrediction(studentId) {
  return request(`/predictions/${encodeURIComponent(studentId)}`);
}

export function toDashboardStudent(student) {
  const labScore = student.lab_performance <= 10 ? student.lab_performance * 10 : student.lab_performance;
  const subjectScores = [
    ["Python Programming", student.internal_marks],
    ["Database Management System (DBMS)", student.assignment_score],
    ["Data Structures & Algorithms", student.internal_marks],
    ["Programming in C", student.assignment_score],
    ["Web Development", student.participation_score],
    ["Operating System", labScore],
    ["Computer Networks", student.attendance],
    ["Artificial Intelligence & Machine Learning", student.participation_score],
  ];
  const overall = Math.round(
    (student.attendance + student.internal_marks + student.assignment_score + labScore + student.participation_score) / 5
  );
  const scores = subjectScores.map(([subject, score]) => ({ subject, score: Math.round(score) }));
  const trend = Array.from({ length: 6 }, () => overall);
  return {
    id: student.student_id,
    name: student.name,
    semester: student.semester ?? null,
    subject: student.subject ?? null,
    cls: student.semester ?? null,
    scores,
    overall,
    trend,
    engagementMetrics: [
      { metric: "Attendance", score: student.attendance },
      { metric: "Assignments", score: student.assignment_score },
      { metric: "Participation", score: student.participation_score },
      { metric: "Homework", score: student.study_hours * 10 },
      { metric: "Midterm", score: student.internal_marks },
    ],
    riskLevel: overall < 62 ? "critical" : overall < 75 ? "atrisk" : "ontrack",
  };
}

