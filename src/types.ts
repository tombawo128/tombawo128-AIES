export type Role =
  | 'student'
  | 'company'
  | 'university'
  | 'academicSupervisor'
  | 'companySupervisor'
  | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  verified: boolean;
  universityId?: string;
  companyId?: string;
  phone?: string;
  address?: string;
  major?: string;       
  department?: string;   
};

export type Internship = {
  id: string;
  title: string;
  companyId: string;
  description: string;
  skills: string[];
  duration: string;
  location: string;
  deadline: string;
  positions: number;
  status: 'Open' | 'Closed';
};

export type Application = {
  id: string;
  studentId: string;
  internshipId: string;
  date: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Rejected' | 'Withdrawn';
  coverLetter: string;
};

export type Report = {
  id: string;
  studentId: string;
  week: number;
  activities: string;
  challenges: string;
  skills: string;
  hours?: number; 
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  fileName?: string;
};

export type Evaluation = {
  id: string;
  applicationId: string;
  evaluatorId: string;
  scores: Record<string, number>;
  comments: string;
  date: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
};

export type University = {
  id: string;
  name: string;
  city: string;
};

export type Data = {
  users: User[];
  internships: Internship[];
  applications: Application[];
  reports: Report[];
  evaluations: Evaluation[];
  notifications: Notification[];
  companies: Company[];
  universities: University[];
};