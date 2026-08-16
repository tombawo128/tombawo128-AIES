export type Role = 'student' | 'company' | 'university' | 'admin';
 

export type User = {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  verified: boolean;
  university_id?: string;
  company_id?: string;
  phone?: string;
  address?: string;
  major?: string;
  department?: string;
  supervisor_id?: string;    
  created_at?: string;
};

export type Internship = {
  id: string;
  title: string;
  company_id: string;
  description: string;
  skills: string;
  duration: string;
  location: string;
  deadline: string;
  positions: number;
  created_at?: string;
  status?: 'Open' | 'Closed' | 'Draft';
};

export type Application = {
  id: string;
  student_id: string;
  internship_id: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  placement_date?: string;     
};

export type Report = {
  id: string;
  student_id: string;
  week: number;
  activities: string;
  challenges: string;
  skills: string;
  hours?: number;
  date: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  file_name?: string;
  feedback?: string;         
  reviewer_id?: string;       
  reviewed_at?: string;       
};

export type Evaluation = {
  id: string;
  application_id: string;
  evaluator_id: string;
  scores: Record<string, number>;
  comments: string;
  date: string;
};

export type Notification = {
  id: string;
  user_id: string;
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
  email?: string;
  active?: boolean;
  verified?: boolean;
};

export type University = {
  id: string;
  name: string;
  city: string;
  email?: string;
  active?: boolean;
  verified?: boolean;
};

export type Department = {
  id: string;
  university_id: string;
  department_name: string;
  code?: string;
  description?: string;
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