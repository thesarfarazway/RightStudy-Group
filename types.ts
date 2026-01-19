export enum CourseType {
  TECHNICAL = 'TECHNICAL',
  SCHOOL = 'SCHOOL',
  DEGREE = 'DEGREE'
}

export type SubCategory = 'Fire & Safety' | 'Industrial Safety' | 'Construction' | 'Environmental' | 'General' | 'Management';

export interface FAQ {
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  title: string;
  category: CourseType;
  subCategory?: SubCategory;
  description: string;
  duration: string;
  image: string;
  price?: string;
  priceValue?: number; // Numeric value for sorting/filtering
  popularity?: number; // Score 0-100
  videoUrl?: string; // YouTube Embed URL
  syllabus?: string[];
  faqs?: FAQ[];
  facultyId?: string;
}

export type UserRole = 'student' | 'director' | 'shareholder' | 'employee' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrolledCourses: string[]; // Course IDs
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: string[];
  status: 'Active' | 'Inactive';
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: 'director' | 'shareholder' | 'employee' | 'admin';
  department?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  grade?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  specialization: string;
  image: string;
  bio?: string;
}

export interface SiteSettings {
  // Global Branding
  brandName: string;
  brandSubtitle: string;
  footerDescription: string;

  contactPhone: string;
  contactEmail: string;
  address: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string; 
  heroDescription: string;
  heroImage: string; // URL

  // About Section
  aboutTitle: string; 
  aboutSubtitle: string; 
  aboutDescription: string; 
  
  // Features
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;

  // Featured Courses Section
  featuredSectionTitle: string;
  featuredSectionSubtitle: string;

  // Page Specific Headers
  coursesTitle: string;
  coursesSubtitle: string;
  portalTitle: string;
  portalSubtitle: string;
  certificationText: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// --- Collaboration Types ---

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string; // ISO string
  type: 'text' | 'file';
  fileName?: string;
}

export interface GroupFile {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploaderRole: UserRole;
  date: string;
  size?: string;
}

export interface GroupAnnouncement {
  id: string;
  content: string;
  date: string;
  authorName: string;
}

export interface GroupMemberRole {
    userId: string;
    role: 'admin' | 'coordinator' | 'member';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  allowedRoles: UserRole[]; // Roles that can see/join this group
  type: 'branch' | 'online_batch' | 'general';
  
  // New Identifiers
  branchIdentifier?: string;
  batchIdentifier?: string;
  
  // New Features
  files?: GroupFile[];
  announcements?: GroupAnnouncement[];
  customRoles?: GroupMemberRole[]; // Specific roles within the group
  excludedUserIds?: string[]; // Banned/Removed members
  memberIds?: string[]; // Whitelist of specific members
}

export interface Meeting {
  id: string;
  groupId: string;
  title: string;
  hostName: string;
  isLive: boolean; // Kept for compatibility, true if status === 'live'
  participants: number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: number; // minutes
  status: 'scheduled' | 'live' | 'ended';
}