import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, CourseType, User, UserRole, Announcement, Faculty, Assignment, Student, SiteSettings, Group, ChatMessage, Meeting, Review, GroupFile, GroupAnnouncement, GroupMemberRole, StaffProfile } from '../types';

interface DataContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  enrollInCourse: (courseId: string) => void;

  announcements: Announcement[];
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  faculty: Faculty[];
  addFaculty: (faculty: Faculty) => void;
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  
  assignments: Assignment[];
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (id: string) => void;

  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  removeEnrollment: (studentId: string, courseId: string) => void;

  staff: StaffProfile[];
  addStaff: (staff: StaffProfile) => void;
  updateStaff: (id: string, staff: Partial<StaffProfile>) => void;
  deleteStaff: (id: string) => void;

  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  // Collaboration
  groups: Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  // Group Features
  addGroupFile: (groupId: string, file: GroupFile) => void;
  deleteGroupFile: (groupId: string, fileId: string) => void;
  addGroupAnnouncement: (groupId: string, announcement: GroupAnnouncement) => void;
  deleteGroupAnnouncement: (groupId: string, announcementId: string) => void;
  setGroupMemberRole: (groupId: string, userId: string, role: 'admin' | 'coordinator' | 'member') => void;
  removeGroupMember: (groupId: string, userId: string) => void;
  bulkAddGroupMembers: (groupId: string, userIds: string[]) => void;

  messages: Record<string, ChatMessage[]>; // Map groupId to messages
  sendMessage: (groupId: string, content: string, type?: 'text' | 'file', fileName?: string) => void;
  deleteMessage: (groupId: string, messageId: string) => void;

  meetings: Meeting[];
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  toggleMeeting: (groupId: string, isLive: boolean, title?: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (review: Review) => void;
  deleteReview: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock Data Initialization
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Diploma in Industrial Safety (DIS)',
    category: CourseType.TECHNICAL,
    subCategory: 'Industrial Safety',
    description: 'A comprehensive diploma focusing on industrial hazards, risk management, and safety protocols.',
    duration: '1 Year',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    price: '₹15,000',
    priceValue: 15000,
    popularity: 95,
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    syllabus: ['Hazard Identification', 'Risk Assessment', 'Safety Audit', 'Industrial Laws'],
    faqs: [
        { question: "What is the eligibility?", answer: "10+2 or ITI/Diploma in any Engineering branch." },
        { question: "Is this course recognized?", answer: "Yes, affiliated with NCVTE Govt. of India." }
    ],
    facultyId: '1'
  },
  {
    id: '2',
    title: 'Diploma in Fire & Safety',
    category: CourseType.TECHNICAL,
    subCategory: 'Fire & Safety',
    description: 'Learn fire prevention techniques, firefighting strategies, and safety audits.',
    duration: '1 Year',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800',
    price: '₹12,000',
    priceValue: 12000,
    popularity: 88,
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    syllabus: ['Fire Chemistry', 'Rescue Techniques', 'First Aid', 'Fire Hydraulics'],
    faqs: [
        { question: "Is physical training included?", answer: "Yes, 1 week of intensive drill training." }
    ]
  },
  {
    id: '3',
    title: 'Advanced Diploma in Industrial Safety (ADIS)',
    category: CourseType.TECHNICAL,
    subCategory: 'Industrial Safety',
    description: 'Advanced curriculum for senior safety roles in manufacturing and construction.',
    duration: '1 Year',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    price: '₹25,000',
    priceValue: 25000,
    popularity: 92,
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
  },
  {
    id: '4',
    title: 'NEBOSH IGC',
    category: CourseType.TECHNICAL,
    subCategory: 'Management',
    description: 'Globally recognized qualification for health and safety management professionals.',
    duration: '4 Months',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    price: '₹45,000',
    priceValue: 45000,
    popularity: 75,
  },
  {
    id: '5',
    title: 'OSHA 30-Hour Construction',
    category: CourseType.TECHNICAL,
    subCategory: 'Construction',
    description: 'Essential safety training for construction industry workers and supervisors.',
    duration: '30 Hours',
    image: 'https://images.unsplash.com/photo-1508349083403-518b87e5971c?auto=format&fit=crop&q=80&w=800',
    price: '₹8,000',
    priceValue: 8000,
    popularity: 60
  },
  {
    id: '6',
    title: 'Senior Secondary (Science Stream)',
    category: CourseType.SCHOOL,
    subCategory: 'General',
    description: 'Standard 12th grade education with a focus on Physics, Chemistry, and Mathematics.',
    duration: '2 Years',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    price: '₹30,000',
    priceValue: 30000,
    popularity: 80
  },
  {
    id: '7',
    title: 'Undergraduate Degree (B.Sc Fire & Safety)',
    category: CourseType.DEGREE,
    subCategory: 'Fire & Safety',
    description: 'Full-time bachelor degree program affiliated with university.',
    duration: '3 Years',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    price: '₹90,000',
    priceValue: 90000,
    popularity: 70
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Exam Schedule Released', content: 'The final exams for ADIS batch will commence from 15th Aug.', date: '2024-05-20', author: 'Admin' }
];

const INITIAL_FACULTY: Faculty[] = [
  { 
      id: '1', 
      name: 'Dr. A. Sharma', 
      email: 'asharma@rightstudy.com',
      specialization: 'Industrial Hygiene', 
      image: 'https://i.pravatar.cc/150?u=1',
      bio: 'Dr. Sharma is a renowned expert in Industrial Hygiene.'
  }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: '1', courseId: '1', title: 'Safety Audit Report', dueDate: '2024-06-10', status: 'Pending' },
  { id: '2', courseId: '2', title: 'Fire Hydraulics Calculation', dueDate: '2024-06-15', status: 'Submitted', grade: 'A' }
];

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'John Doe', email: 'john@student.com', phone: '9876543210', enrolledCourses: ['1'], status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@student.com', phone: '9876543211', enrolledCourses: ['2'], status: 'Active' },
];

const INITIAL_STAFF: StaffProfile[] = [
    { id: 'st1', name: 'Mr. Yaqoobi', email: 'director@rightstudy.com', role: 'director', department: 'Management', phone: '9998887776', status: 'Active' },
    { id: 'st2', name: 'Admin One', email: 'admin@rightstudy.com', role: 'admin', department: 'IT', phone: '1231231234', status: 'Active' },
    { id: 'st3', name: 'HR Manager', email: 'hr@rightstudy.com', role: 'employee', department: 'Human Resources', phone: '5556667777', status: 'Active' }
];

const INITIAL_SETTINGS: SiteSettings = {
  brandName: 'RightStudy',
  brandSubtitle: 'Education Group',
  footerDescription: 'A subsidiary of Yaqoobi Empire Pvt. Ltd. (Yaqoobi Rightstudy LLP). Affiliated with NCVTE and NSDVE Govt. Of India. Empowering students through technical and academic excellence.',

  contactPhone: '+91 98765 43210',
  contactEmail: 'info@rightstudy.com',
  address: 'Corporate Office: New Delhi, India',
  
  heroTitle: 'Building Leaders in\nSafety & Excellence',
  heroSubtitle: 'Premier Institute for Industrial Safety', 
  heroDescription: 'RightStudy Technical Institute & School of Excellence. Premier education in Industrial Safety, Fire & Safety, NEBOSH, and academic schooling. Affiliated with NCVTE and NSDVE Govt. of India.',
  heroImage: 'https://picsum.photos/1920/1080?grayscale',

  aboutTitle: 'Accredited & Recognized Excellence',
  aboutSubtitle: 'Why Choose Us',
  aboutDescription: 'We provide world-class technical education with government affiliations and expert faculty.',

  feature1Title: 'Govt. Recognized',
  feature1Desc: 'Affiliated from NCVTE and NSDVE Govt. Of India for technical and vocational excellence.',
  feature2Title: 'Comprehensive Curriculum',
  feature2Desc: 'From Safety Officer diplomas to Secondary Schooling (RightStudy School of Excellence).',
  feature3Title: 'Expert Faculty',
  feature3Desc: 'Subsidiary of Yaqoobi Empire Pvt. Ltd., bringing industry veterans to the classroom.',

  featuredSectionTitle: 'Featured Programs',
  featuredSectionSubtitle: 'Kickstart your career in safety management today.',

  coursesTitle: 'Our Programs',
  coursesSubtitle: 'Choose from a wide range of technical and academic courses.',
  portalTitle: 'RightStudy Portal',
  portalSubtitle: 'Secure access for Institute members.',
  certificationText: 'Upon successful completion of this course, you will receive a certification from RightStudy Technical Institute, affiliated with NCVTE/NSDVE Govt. Of India. This certification is recognized for industrial safety roles globally.'
};

const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', courseId: '1', userId: 'u2', userName: 'John Doe', rating: 5, comment: 'Excellent course material and practical sessions.', date: '2023-11-15' },
];

// --- Initial Collaboration Data ---

const INITIAL_GROUPS: Group[] = [
  // Branch Groups
  { 
    id: 'g_delhi', 
    name: 'RightStudy Technical Institute, Malviya Nagar, Delhi', 
    description: 'Official group for Malviya Nagar Branch members.', 
    type: 'branch', 
    allowedRoles: ['student', 'teacher', 'employee', 'director', 'shareholder', 'admin'],
    branchIdentifier: 'Malviya Nagar, Delhi',
    files: [],
    announcements: [
        { id: 'ga1', content: 'Welcome to the new semester at Malviya Nagar branch!', date: '2024-01-10', authorName: 'Branch Manager' }
    ]
  },
  { id: 'g_mirganj', name: 'RightStudy, Mirganj, Gopalganj, Bihar', description: 'Official group for Mirganj Branch members.', type: 'branch', allowedRoles: ['student', 'teacher', 'employee', 'director', 'shareholder', 'admin'], branchIdentifier: 'Mirganj, Bihar' },
  { id: 'g_ballia1', name: 'RightStudy, Shukhpura, Ballia, UP', description: 'Official group for Shukhpura Branch members.', type: 'branch', allowedRoles: ['student', 'teacher', 'employee', 'director', 'shareholder', 'admin'], branchIdentifier: 'Shukhpura, Ballia' },
  { id: 'g_ballia2', name: 'RightStudy, Belthara road, Ballia, UP', description: 'Official group for Belthara Road Branch members.', type: 'branch', allowedRoles: ['student', 'teacher', 'employee', 'director', 'shareholder', 'admin'], branchIdentifier: 'Belthara Road, Ballia' },
  
  // Online Batch Groups
  { 
    id: 'b_mb1', 
    name: 'RightStudy Online Morning Batch MB1', 
    description: 'Daily 8:00 AM - 11:00 AM', 
    type: 'online_batch', 
    allowedRoles: ['student', 'teacher', 'admin'],
    batchIdentifier: 'MB1',
    files: [
        { id: 'f1', name: 'Syllabus_MB1.pdf', url: '#', uploadedBy: 'Admin', uploaderRole: 'admin', date: '2024-02-01', size: '2.5 MB' }
    ]
  },
  { id: 'b_ab1', name: 'RightStudy Online Afternoon Batch AB1', description: 'Daily 1:00 PM - 4:00 PM', type: 'online_batch', allowedRoles: ['student', 'teacher', 'admin'], batchIdentifier: 'AB1' },
  { id: 'b_eb1', name: 'RightStudy Online Evening Batch EB1', description: 'Daily 6:00 PM - 9:00 PM', type: 'online_batch', allowedRoles: ['student', 'teacher', 'admin'], batchIdentifier: 'EB1' },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'g_delhi': [
    { id: 'm1', senderId: 'u1', senderName: 'Admin', senderRole: 'admin', content: 'Welcome to the Delhi Branch group!', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'text' },
  ],
  'b_mb1': [
     { id: 'm2', senderId: 'u1', senderName: 'Dr. A. Sharma', senderRole: 'teacher', content: 'Good morning everyone. Class starts in 10 mins.', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
     { id: 'm3', senderId: 'u1', senderName: 'Dr. A. Sharma', senderRole: 'teacher', content: 'Notes_Chapter1.pdf', timestamp: new Date(Date.now() - 3500000).toISOString(), type: 'file', fileName: 'Notes_Chapter1.pdf' }
  ]
};

const INITIAL_MEETINGS: Meeting[] = [
    { id: 'mt1', groupId: 'b_mb1', title: 'Industrial Safety - Intro', hostName: 'Dr. A. Sharma', isLive: true, participants: 12, status: 'live' }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [faculty, setFaculty] = useState<Faculty[]>(INITIAL_FACULTY);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [staff, setStaff] = useState<StaffProfile[]>(INITIAL_STAFF);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  
  // Collaboration State
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // --- Actions ---

  const addCourse = (course: Course) => setCourses([...courses, course]);
  const updateCourse = (id: string, updated: Partial<Course>) => setCourses(courses.map(c => c.id === id ? { ...c, ...updated } : c));
  const deleteCourse = (id: string) => setCourses(courses.filter(c => c.id !== id));

  const addAnnouncement = (announcement: Announcement) => setAnnouncements([...announcements, announcement]);
  const updateAnnouncement = (id: string, updated: Partial<Announcement>) => setAnnouncements(announcements.map(a => a.id === id ? { ...a, ...updated } : a));
  const deleteAnnouncement = (id: string) => setAnnouncements(announcements.filter(a => a.id !== id));

  const addFaculty = (f: Faculty) => setFaculty([...faculty, f]);
  const updateFaculty = (id: string, updated: Partial<Faculty>) => setFaculty(faculty.map(f => f.id === id ? { ...f, ...updated } : f));
  const deleteFaculty = (id: string) => setFaculty(faculty.filter(f => f.id !== id));

  const addStudent = (s: Student) => setStudents([...students, s]);
  const updateStudent = (id: string, updated: Partial<Student>) => setStudents(students.map(s => s.id === id ? { ...s, ...updated } : s));
  const deleteStudent = (id: string) => setStudents(students.filter(s => s.id !== id));
  
  const removeEnrollment = (studentId: string, courseId: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          enrolledCourses: student.enrolledCourses.filter(id => id !== courseId)
        };
      }
      return student;
    }));
  };

  const addStaff = (s: StaffProfile) => setStaff([...staff, s]);
  const updateStaff = (id: string, updated: Partial<StaffProfile>) => setStaff(staff.map(s => s.id === id ? { ...s, ...updated } : s));
  const deleteStaff = (id: string) => setStaff(staff.filter(s => s.id !== id));

  const addAssignment = (a: Assignment) => setAssignments([...assignments, a]);
  const updateAssignment = (id: string, updated: Partial<Assignment>) => setAssignments(assignments.map(a => a.id === id ? { ...a, ...updated } : a));
  const deleteAssignment = (id: string) => setAssignments(assignments.filter(a => a.id !== id));
  const submitAssignment = (id: string) => setAssignments(assignments.map(a => a.id === id ? { ...a, status: 'Submitted' } : a));

  const updateSiteSettings = (settings: Partial<SiteSettings>) => setSiteSettings({ ...siteSettings, ...settings });

  // Collaboration Actions
  const addGroup = (g: Group) => setGroups([...groups, g]);
  const updateGroup = (id: string, updated: Partial<Group>) => setGroups(groups.map(g => g.id === id ? { ...g, ...updated } : g));
  const deleteGroup = (id: string) => setGroups(groups.filter(g => g.id !== id));

  // New Group Feature Actions
  const addGroupFile = (groupId: string, file: GroupFile) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, files: [...(g.files || []), file] } : g));
  };
  
  const deleteGroupFile = (groupId: string, fileId: string) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, files: (g.files || []).filter(f => f.id !== fileId) } : g));
  };

  const addGroupAnnouncement = (groupId: string, announcement: GroupAnnouncement) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, announcements: [...(g.announcements || []), announcement] } : g));
  };

  const deleteGroupAnnouncement = (groupId: string, announcementId: string) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, announcements: (g.announcements || []).filter(a => a.id !== announcementId) } : g));
  };

  const setGroupMemberRole = (groupId: string, userId: string, role: 'admin' | 'coordinator' | 'member') => {
      setGroups(prev => prev.map(g => {
          if (g.id !== groupId) return g;
          const currentRoles = g.customRoles || [];
          const existing = currentRoles.find(r => r.userId === userId);
          let newRoles;
          if (existing) {
              newRoles = currentRoles.map(r => r.userId === userId ? { ...r, role } : r);
          } else {
              newRoles = [...currentRoles, { userId, role }];
          }
          return { ...g, customRoles: newRoles };
      }));
  };

  const removeGroupMember = (groupId: string, userId: string) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, excludedUserIds: [...(g.excludedUserIds || []), userId] } : g));
  };

  const bulkAddGroupMembers = (groupId: string, userIds: string[]) => {
      setGroups(prev => prev.map(g => {
          if (g.id !== groupId) return g;
          // Add IDs avoiding duplicates
          const currentMembers = g.memberIds || [];
          const newMembers = [...new Set([...currentMembers, ...userIds])];
          return { ...g, memberIds: newMembers };
      }));
  };

  const sendMessage = (groupId: string, content: string, type: 'text' | 'file' = 'text', fileName?: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content,
      timestamp: new Date().toISOString(),
      type,
      fileName
    };
    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMessage]
    }));
  };

  const deleteMessage = (groupId: string, messageId: string) => {
      setMessages(prev => ({
          ...prev,
          [groupId]: prev[groupId].filter(m => m.id !== messageId)
      }));
  };

  // Meeting Management
  const addMeeting = (meeting: Meeting) => setMeetings([...meetings, meeting]);
  const updateMeeting = (id: string, updated: Partial<Meeting>) => setMeetings(meetings.map(m => m.id === id ? { ...m, ...updated } : m));
  const deleteMeeting = (id: string) => setMeetings(meetings.filter(m => m.id !== id));

  const toggleMeeting = (groupId: string, isLive: boolean, title?: string) => {
      if (isLive) {
          const newMeeting: Meeting = {
              id: `mt-${Date.now()}`,
              groupId,
              title: title || 'Live Meeting',
              hostName: user?.name || 'Admin',
              isLive: true,
              participants: 1,
              status: 'live',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          // Remove existing live meeting for group if any
          setMeetings(prev => [...prev.filter(m => m.groupId !== groupId), newMeeting]);
      } else {
          setMeetings(prev => prev.map(m => m.groupId === groupId ? { ...m, isLive: false, status: 'ended' } : m));
      }
  };

  const addReview = (review: Review) => setReviews([...reviews, review]);
  const deleteReview = (id: string) => setReviews(reviews.filter(r => r.id !== id));

  // Auth Mock
  const login = (email: string, role: UserRole) => {
      if (role === 'student') {
          const s = students.find(x => x.email === email);
          if (s) {
              setUser({ id: s.id, name: s.name, email: s.email, role: 'student', enrolledCourses: s.enrolledCourses });
              return;
          }
      } else if (role === 'teacher') {
          const f = faculty.find(x => x.email === email);
          if (f) {
              setUser({ id: f.id, name: f.name, email: f.email, role: 'teacher', enrolledCourses: [] });
              return;
          }
      } else {
          // Check staff (Director, Shareholder, Employee, Admin)
          const st = staff.find(x => x.email === email && x.role === role);
          if (st) {
               setUser({ id: st.id, name: st.name, email: st.email, role: st.role as UserRole, enrolledCourses: [] });
               return;
          }
      }
      
      // Fallback for demo convenience if email doesn't match predefined list
      const fallbackName = role.charAt(0).toUpperCase() + role.slice(1) + ' User';
      setUser({ id: `u-${Date.now()}`, name: fallbackName, email: email, role: role, enrolledCourses: [] });
  };

  const logout = () => setUser(null);

  const enrollInCourse = (courseId: string) => {
      if (!user) return;
      // In a real app, this would be an API call
      // Update local user state
      setUser({ ...user, enrolledCourses: [...user.enrolledCourses, courseId] });
      // Update student record if role is student
      if (user.role === 'student') {
          updateStudent(user.id, { enrolledCourses: [...user.enrolledCourses, courseId] });
      }
  };

  return (
    <DataContext.Provider value={{
      courses, addCourse, updateCourse, deleteCourse,
      user, login, logout, enrollInCourse,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      faculty, addFaculty, updateFaculty, deleteFaculty,
      assignments, addAssignment, updateAssignment, deleteAssignment, submitAssignment,
      students, addStudent, updateStudent, deleteStudent, removeEnrollment,
      staff, addStaff, updateStaff, deleteStaff,
      siteSettings, updateSiteSettings,
      groups, addGroup, updateGroup, deleteGroup,
      addGroupFile, deleteGroupFile, addGroupAnnouncement, deleteGroupAnnouncement, setGroupMemberRole, removeGroupMember, bulkAddGroupMembers,
      messages, sendMessage, deleteMessage,
      meetings, addMeeting, updateMeeting, deleteMeeting, toggleMeeting,
      reviews, addReview, deleteReview
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};