import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';
import { Internship } from '../../types';

export const StudentInternships: React.FC = () => {
  const { user } = useApp();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      let query = supabase.from('internships').select('*');

      // If student has a university_id, fetch only relevant internships (optional)
      if (user?.university_id) {
        // You could add a filter here if internships are linked to universities
        // For now, we fetch all open ones
      }

      const { data, error } = await query;
      if (error) {
        console.error('Failed to fetch internships:', error);
      } else {
        setInternships(data || []);
      }
      setLoading(false);
    };

    fetchInternships();
  }, [user]);

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHead
        eyebrow="Student"
        title="Internships"
        description="Find your next opportunity."
      />
      <div className="toolbar">
        <div className="search">
          <input
            placeholder="Search internships..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <Empty title="No internships found" text="Try adjusting your search." />
      ) : (
        <div className="cards3">
          {filtered.map((internship) => (
            <div className="card internship" key={internship.id}>
              <h2>{internship.title}</h2>
              <p>{internship.description.slice(0, 120)}...</p>
              <div className="meta">
                <span>📍 {internship.location}</span>
                <span>⏳ {internship.duration}</span>
                <span>🎯 {internship.positions} positions</span>
              </div>
              <div className="chips">
                {internship.skills.split(',').map((skill) => (
                  <span key={skill.trim()}>{skill.trim()}</span>
                ))}
              </div>
              <button className="primary">Apply Now</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};