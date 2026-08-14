export const id = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const roleLabel = (r: string): string =>
  ({
    student: 'Student',
    company: 'Company',
    university: 'University',
    academicSupervisor: 'Academic Supervisor',
    companySupervisor: 'Company Supervisor',
    admin: 'Administrator',
  }[r] || r);

export const addNote = (data: any, userId: string, title: string, message: string) => {
  data.notifications = [
    ...data.notifications,
    {
      id: id('n'),
      userId,
      title,
      message,
      read: false,
      date: new Date().toISOString(),
    },
  ];
};
