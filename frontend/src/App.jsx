import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const scoreClass = (value) => {
  if (value >= 90) return 'excellent';
  if (value >= 75) return 'good';
  if (value >= 60) return 'average';
  return 'risk';
};

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasData = useMemo(() => Boolean(data?.students?.length), [data]);

  const analyzeFile = async () => {
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to process file.');
      }

      setData(payload);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="mesh" />
      <header className="hero card">
        <p className="eyebrow">Automated Profiler</p>
        <h1>Student Performance & Attendance Dashboard</h1>
        <p>
          Upload your class CSV to run preprocessing, aggregate statistics, GPA calculation, percentile ranking,
          and automated remarks generation.
        </p>
        <div className="controls">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button type="button" onClick={analyzeFile} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Dataset'}
          </button>
          <a href="http://localhost:5000/health" target="_blank" rel="noreferrer">
            API Health
          </a>
        </div>
        {file ? <p className="hint">Selected: {file.name}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </header>

      {hasData ? (
        <main className="grid">
          <section className="card metrics">
            <h2>Class Summary</h2>
            <div className="metric-grid">
              <article>
                <p>Students</p>
                <strong>{data.summary.student_count}</strong>
              </article>
              <article>
                <p>Subjects</p>
                <strong>{data.summary.subject_count}</strong>
              </article>
              <article>
                <p>Class Average</p>
                <strong>{data.summary.class_average}</strong>
              </article>
              <article>
                <p>Class GPA</p>
                <strong>{data.summary.class_gpa}</strong>
              </article>
            </div>
          </section>

          <section className="card">
            <h2>Subject Statistics</h2>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Avg</th>
                  <th>Std Dev</th>
                  <th>Min</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {data.subject_stats.map((subject) => (
                  <tr key={subject.subject}>
                    <td>{subject.subject}</td>
                    <td>{subject.average}</td>
                    <td>{subject.std_dev}</td>
                    <td>{subject.min}</td>
                    <td>{subject.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>Top 10% Students (Percentile)</h2>
            {data.top_10_percent.length ? (
              <ul className="top-list">
                {data.top_10_percent.map((student) => (
                  <li key={student.email}>
                    <div>
                      <strong>{student.name}</strong>
                      <p>{student.email}</p>
                    </div>
                    <span>{student.percentile}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No student reached the 90th percentile in this dataset.</p>
            )}
          </section>

          <section className="card full">
            <h2>Processed Student Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Avg</th>
                  <th>GPA</th>
                  <th>Percentile</th>
                  <th>Attendance</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={`${student.email}-${student.name}`}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`badge ${scoreClass(student.average)}`}>{student.average}</span>
                    </td>
                    <td>{student.gpa}</td>
                    <td>{student.percentile}</td>
                    <td>{student.attendance ?? '-'}</td>
                    <td>{student.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      ) : (
        <section className="card guide">
          <h2>CSV Template</h2>
          <p>
            Include at least a <code>Name</code> column and one or more subject columns. Optional columns:
            <code>Email</code> and <code>Attendance</code>. You can mark absences as <code>Absent</code>,
            <code>AB</code>, or leave cells blank.
          </p>
          <pre>
Name,Email,Attendance,Math,Physics,Chemistry,English
Rahul Sharma,rahul@college.edu,92,88,91,Absent,79
Ananya Singh,,97,95,89,93,90
          </pre>
          <p>Sample file available in backend: <code>backend/sample_students.csv</code></p>
        </section>
      )}
    </div>
  );
}

export default App;
