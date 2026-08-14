import React from 'react';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';

export const UniversityDepartments: React.FC = () => {
  return (
    <>
      <PageHead eyebrow="University workspace" title="Departments" description="Department structure can be connected later." />
      <div className="card">
        <Empty title="No department records" text="Add departments when the university data source is connected." />
      </div>
    </>
  );
};