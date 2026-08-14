import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';
import { addNote, id } from '../../utils';

export const StudentReports: React.FC = () => {
  const { data, user, setData } = useApp();
  
  // 1. Early return to fix the 'user is possibly null' error
  if (!user) return null;

  const [activities, setActivities] = useState('');
  const [challenges, setChallenges] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // 2. TypeScript now knows user.id is definitely here
  const list = data.reports.filter((r) => r.studentId === user.id);

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const newReport = {
    id: id('r'),
    studentId: user.id,
    week: list.length + 1,
    activities,
    challenges,
    skills,
    hours: parseInt(hours) || 0,
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending' as const,
    fileName: file?.name,
  };

  // 1. Save to MySQL
  const res = await fetch('http://localhost/aies-api/api/reports.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReport),
  });
  const result = await res.json();

  if (result.success) {
    // 2. Update local React state so it shows up instantly without refresh
    setData((prev) => ({
      ...prev,
      reports: [...prev.reports, newReport]
    }));
    
    // 3. Clear fields
    setActivities('');
    setChallenges('');
    setSkills('');
    setHours('');
    setFile(null);
  } else {
    alert('Failed to submit report: ' + result.message);
  }
};

  return (
    <>
      <PageHead eyebrow="Student workspace" title="Weekly reports" description="Document work, challenges and skills learned each week." />
      <form className="card formGrid" onSubmit={submit}>
        <label className="span2">
          Activities completed
          <textarea value={activities} onChange={(e) => setActivities(e.target.value)} required />
        </label>
        <label>
          Challenges
          <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} required />
        </label>
        <label>
          Skills learned
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} required />
        </label>
        
        {/* Hours Worked Input */}
        <label className="span2">
          Hours worked this week
          <input 
            type="number" 
            value={hours} 
            onChange={(e) => setHours(e.target.value)} 
            min="0" 
            step="0.5"
            placeholder="e.g. 37.5" 
            required 
          />
        </label>

        <label className="span2">
          Attachment
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <button className="primary span2">Submit report</button>
      </form>
      <div className="card reportList">
        {list.length ? (
          list.map((r) => (
            <div className="report" key={r.id}>
              <div>
                <strong>Week {r.week}</strong>
                <span>{r.date} · {r.fileName || 'No attachment'}</span>
                <p>{r.activities}</p>
                <small>Challenges: {r.challenges}</small>
                <small>Skills: {r.skills}</small>
                {/* Display Hours Worked */}
                <small style={{ marginTop: '4px', display: 'block', fontWeight: 600, color: '#23212c' }}>
                  Hours worked: {r.hours || 0}h
                </small>
              </div>
              <div className="rowActions">
                <Status value={r.status} />
              </div>
            </div>
          ))
        ) : (
          <Empty title="No reports" text="Submit your first weekly report above." />
        )}
      </div>
    </>
  );
};