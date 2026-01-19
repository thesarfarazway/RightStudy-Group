import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Course, CourseType, Announcement, Faculty, SubCategory, Student, SiteSettings, Group, Assignment, UserRole, Review, FAQ, StaffProfile, Meeting } from '../types';
import { Plus, Trash2, Edit2, Users, BookOpen, Bell, Briefcase, X, Settings as SettingsIcon, Save, Star, MessageSquare, FileText, Video, Upload, CheckCircle, XCircle, Download, Search, Info, HelpCircle, Image as ImageIcon, LayoutDashboard, ChevronRight, Eye, Shield, Lock, Calendar, Bold, Italic, List, Link as LinkIcon, Menu, MoreVertical, Paperclip, MapPin, Globe, Filter } from 'lucide-react';

// Helper: Simple Rich Text Editor
const SimpleRichTextEditor: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Initialize content on mount
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, []); 

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const applyFormat = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <div className="flex items-center space-x-1 border-b border-slate-200 bg-slate-50 p-2 overflow-x-auto">
                <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Bold">
                    <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Italic">
                    <Italic className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Bullet List">
                    <List className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) applyFormat('createLink', url);
                }} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Link">
                    <LinkIcon className="w-4 h-4" />
                </button>
            </div>
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="rich-editor-content p-3 min-h-[120px] max-h-[200px] overflow-y-auto outline-none text-sm text-slate-700"
            />
        </div>
    );
};

const AdminCMS: React.FC = () => {
  const { 
      courses, addCourse, updateCourse, deleteCourse, 
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, 
      faculty, addFaculty, updateFaculty, deleteFaculty,
      students, addStudent, updateStudent, deleteStudent, removeEnrollment,
      staff, addStaff, updateStaff, deleteStaff,
      siteSettings, updateSiteSettings,
      reviews, deleteReview,
      groups, addGroup, updateGroup, deleteGroup,
      addGroupFile, deleteGroupFile, addGroupAnnouncement, deleteGroupAnnouncement, setGroupMemberRole, removeGroupMember, bulkAddGroupMembers,
      assignments, addAssignment, updateAssignment, deleteAssignment,
      meetings, addMeeting, updateMeeting, deleteMeeting, toggleMeeting, user,
      messages, deleteMessage
  } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'announcements' | 'faculty' | 'students' | 'staff' | 'enrollments' | 'reviews' | 'groups' | 'assignments' | 'settings' | 'meetings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Group Modal Specific State
  const [groupModalTab, setGroupModalTab] = useState<'details' | 'files' | 'members' | 'announcements' | 'chat'>('details');
  const [groupSearch, setGroupSearch] = useState('');
  
  const csvMemberInputRef = useRef<HTMLInputElement>(null);

  // --- Filtering State ---
  const [courseFilterCategory, setCourseFilterCategory] = useState<string>('ALL');
  const [courseFilterSubCategory, setCourseFilterSubCategory] = useState<string>('ALL');
  const [courseFilterPrice, setCourseFilterPrice] = useState<string>('ALL');

  // --- Form States ---
  const [courseForm, setCourseForm] = useState<Partial<Course>>({});
  const [courseFaqs, setCourseFaqs] = useState<FAQ[]>([]);
  const [newFaq, setNewFaq] = useState<FAQ>({ question: '', answer: '' });
  const [syllabusText, setSyllabusText] = useState('');
  
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({});
  const [facultyForm, setFacultyForm] = useState<Partial<Faculty>>({});
  const [facultySelectedCourses, setFacultySelectedCourses] = useState<string[]>([]);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [staffForm, setStaffForm] = useState<Partial<StaffProfile>>({});
  const [groupForm, setGroupForm] = useState<Partial<Group>>({});
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({});
  const [meetingForm, setMeetingForm] = useState<Partial<Meeting>>({});
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  const subCategoryOptions: SubCategory[] = ['Fire & Safety', 'Industrial Safety', 'Construction', 'Environmental', 'Management', 'General'];
  const allRoles: UserRole[] = ['student', 'teacher', 'employee', 'director', 'shareholder', 'admin'];

  // --- Styles Helper ---
  const getGroupStyles = (type: string) => {
      switch(type) {
          case 'branch': return { 
              bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: MapPin, 
              badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-800'
          };
          case 'online_batch': return { 
              bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: Globe,
              badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800'
          };
          default: return { 
              bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Users,
              badgeBg: 'bg-slate-100', badgeText: 'text-slate-800'
          };
      }
  };

  // --- Filter Logic ---
  const getFilteredCourses = () => {
      return courses.filter(course => {
          const catMatch = courseFilterCategory === 'ALL' || course.category === courseFilterCategory;
          const subCatMatch = courseFilterSubCategory === 'ALL' || course.subCategory === courseFilterSubCategory;
          
          let priceMatch = true;
          const p = course.priceValue || 0;
          if (courseFilterPrice === 'LOW') priceMatch = p < 10000;
          else if (courseFilterPrice === 'MEDIUM') priceMatch = p >= 10000 && p <= 25000;
          else if (courseFilterPrice === 'HIGH') priceMatch = p > 25000;

          return catMatch && subCatMatch && priceMatch;
      });
  };

  const getFilteredGroups = () => {
      if (!groupSearch) return groups;
      const lower = groupSearch.toLowerCase();
      return groups.filter(g => 
        g.name.toLowerCase().includes(lower) || 
        g.branchIdentifier?.toLowerCase().includes(lower) || 
        g.batchIdentifier?.toLowerCase().includes(lower)
      );
  };

  // --- Image Upload Helper ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setter(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  // --- Delete Handlers with Confirmation ---
  const handleDelete = (type: 'course' | 'announcement' | 'faculty' | 'student' | 'staff' | 'group' | 'assignment' | 'review' | 'meeting', id: string) => {
      if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
          return;
      }
      switch (type) {
          case 'course': deleteCourse(id); break;
          case 'announcement': deleteAnnouncement(id); break;
          case 'faculty': deleteFaculty(id); break;
          case 'student': deleteStudent(id); break;
          case 'staff': deleteStaff(id); break;
          case 'group': deleteGroup(id); break;
          case 'assignment': deleteAssignment(id); break;
          case 'review': deleteReview(id); break;
          case 'meeting': deleteMeeting(id); break;
      }
  };

  // Helper Wrappers for Deletions
  const confirmAndDeleteGroupFile = (groupId: string, fileId: string) => {
      if (window.confirm("Are you sure you want to delete this file?")) {
          deleteGroupFile(groupId, fileId);
      }
  };
  const confirmAndDeleteGroupAnnouncement = (groupId: string, annId: string) => {
      if (window.confirm("Are you sure you want to delete this announcement?")) {
          deleteGroupAnnouncement(groupId, annId);
      }
  };
  const confirmAndRemoveGroupMember = (groupId: string, userId: string) => {
      if (window.confirm("Are you sure you want to remove this member from the group?")) {
          removeGroupMember(groupId, userId);
      }
  };
  const handleEndMeeting = (groupId: string) => {
      if (window.confirm("Are you sure you want to forcefully end this live meeting?")) {
          toggleMeeting(groupId, false);
      }
  };
  const handleRemoveEnrollment = (studentId: string, courseId: string) => {
      if (window.confirm("Are you sure you want to remove this student from the course?")) {
          removeEnrollment(studentId, courseId);
      }
  };

  // --- Toggle Handlers ---
  const handleToggleStudentStatus = (student: Student) => {
      const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
      if (window.confirm(`Change status of ${student.name} to ${newStatus}?`)) {
          updateStudent(student.id, { status: newStatus });
      }
  };
  const handleToggleStaffStatus = (member: StaffProfile) => {
      const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
      if (window.confirm(`Change status of ${member.name} to ${newStatus}?`)) {
          updateStaff(member.id, { status: newStatus });
      }
  };

  // --- CSV Import ---
  const handleBulkAddMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingId) return;
      if (!window.confirm(`Add members from CSV to this group?`)) {
          if (e.target) e.target.value = '';
          return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const emailsToAdd: string[] = [];
          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line) {
                  const cols = line.split(',').map(c => c.trim());
                  if(cols[0]) emailsToAdd.push(cols[0]);
              }
          }
          const idsToAdd = students.filter(s => emailsToAdd.includes(s.email)).map(s => s.id);
          const facultyIds = faculty.filter(f => emailsToAdd.includes(f.email || '')).map(f => f.id);
          const staffIds = staff.filter(s => emailsToAdd.includes(s.email)).map(s => s.id);
          const allIds = [...idsToAdd, ...facultyIds, ...staffIds];
          if (allIds.length > 0) {
              bulkAddGroupMembers(editingId, allIds);
              alert(`Added ${allIds.length} members to the group.`);
          } else {
              alert("No matching users found for emails in CSV.");
          }
          if (e.target) e.target.value = '';
      };
      reader.readAsText(file);
  };

  const downloadMemberTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,Email\nstudent@example.com";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "member_import_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- FAQ Handlers ---
  const handleAddFaq = () => {
      if (newFaq.question && newFaq.answer) {
          setCourseFaqs([...courseFaqs, newFaq]);
          setNewFaq({ question: '', answer: '' });
      }
  };
  const handleRemoveFaq = (index: number) => {
      setCourseFaqs(courseFaqs.filter((_, i) => i !== index));
  };

  // --- Modal & Form Logic ---
  const openModal = (type: 'add' | 'edit', data?: any) => {
      setEditingId(type === 'edit' && data ? data.id : null);
      if (type === 'edit' && data) {
          if (activeTab === 'courses') { setCourseForm(data); setSyllabusText(data.syllabus ? data.syllabus.join('\n') : ''); setCourseFaqs(data.faqs || []); }
          if (activeTab === 'announcements') setAnnouncementForm(data);
          if (activeTab === 'faculty') { setFacultyForm(data); setFacultySelectedCourses(courses.filter(c => c.facultyId === data.id).map(c => c.id)); }
          if (activeTab === 'students') setStudentForm(data);
          if (activeTab === 'staff') setStaffForm(data);
          if (activeTab === 'groups') { setGroupForm(data); setGroupModalTab('details'); }
          if (activeTab === 'assignments') setAssignmentForm(data);
          if (activeTab === 'meetings') setMeetingForm(data);
      } else {
          // Reset forms for add
          if (activeTab === 'courses') { setCourseForm({ title: '', description: '', duration: '', category: CourseType.TECHNICAL, subCategory: 'General', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', price: '', videoUrl: '', facultyId: '', syllabus: [], popularity: 50 }); setSyllabusText(''); setCourseFaqs([]); }
          if (activeTab === 'announcements') setAnnouncementForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], author: 'Admin' });
          if (activeTab === 'faculty') { setFacultyForm({ name: '', email: '', specialization: '', image: 'https://i.pravatar.cc/150', bio: '' }); setFacultySelectedCourses([]); }
          if (activeTab === 'students') setStudentForm({ name: '', email: '', phone: '', status: 'Active', enrolledCourses: [] });
          if (activeTab === 'staff') setStaffForm({ name: '', email: '', role: 'employee', status: 'Active', department: '' });
          if (activeTab === 'groups') { setGroupForm({ name: '', description: '', type: 'general', allowedRoles: ['admin', 'student', 'teacher'] }); setGroupModalTab('details'); }
          if (activeTab === 'assignments') setAssignmentForm({ title: '', courseId: courses[0]?.id || '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending', grade: '' });
          if (activeTab === 'meetings') setMeetingForm({ title: '', groupId: groups[0]?.id || '', date: new Date().toISOString().split('T')[0], time: '10:00', duration: 60, status: 'scheduled' });
      }
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (activeTab === 'courses') {
          const priceVal = courseForm.price ? parseInt(courseForm.price.replace(/[^0-9]/g, '')) : 0;
          const syllabusArray = syllabusText.split('\n').filter(line => line.trim() !== '');
          const courseData = { ...courseForm, priceValue: priceVal, subCategory: courseForm.subCategory || 'General', syllabus: syllabusArray, faqs: courseFaqs };
          if (editingId) updateCourse(editingId, courseData);
          else addCourse({ ...courseData, id: `c-${Date.now()}` } as Course);
      } else if (activeTab === 'announcements') {
          if (editingId) updateAnnouncement(editingId, announcementForm);
          else addAnnouncement({ ...announcementForm, id: `a-${Date.now()}` } as Announcement);
      } else if (activeTab === 'faculty') {
          let facId = editingId;
          if (facId) updateFaculty(facId, facultyForm);
          else { facId = `f-${Date.now()}`; addFaculty({ ...facultyForm, id: facId } as Faculty); }
          if (editingId) courses.forEach(c => { if (c.facultyId === editingId && !facultySelectedCourses.includes(c.id)) updateCourse(c.id, { facultyId: undefined }); });
          facultySelectedCourses.forEach(cId => updateCourse(cId, { facultyId: facId! }));
      } else if (activeTab === 'students') {
          if (editingId) updateStudent(editingId, studentForm);
          else addStudent({ ...studentForm, id: `s-${Date.now()}` } as Student);
      } else if (activeTab === 'staff') {
          if (editingId) updateStaff(editingId, staffForm);
          else addStaff({ ...staffForm, id: `st-${Date.now()}` } as StaffProfile);
      } else if (activeTab === 'groups') {
          if (editingId) updateGroup(editingId, groupForm);
          else addGroup({ ...groupForm, id: `g-${Date.now()}` } as Group);
      } else if (activeTab === 'assignments') {
          if (editingId) updateAssignment(editingId, assignmentForm);
          else addAssignment({ ...assignmentForm, id: `as-${Date.now()}` } as Assignment);
      } else if (activeTab === 'meetings') {
          const meetingData = { ...meetingForm, hostName: user?.name || 'Admin', isLive: meetingForm.status === 'live', participants: 0 };
          if (editingId) updateMeeting(editingId, meetingData);
          else addMeeting({ ...meetingData, id: `mt-${Date.now()}` } as Meeting);
      }
      setIsModalOpen(false);
  };

  const handleSettingsSave = () => { updateSiteSettings(settingsForm); alert('Settings saved successfully!'); };
  
  const handleGroupFileUpload = (groupId: string) => {
      const fileName = prompt("Enter file name to mock upload:");
      if(fileName) addGroupFile(groupId, { id: `gf-${Date.now()}`, name: fileName, url: '#', uploadedBy: 'Admin', uploaderRole: 'admin', date: new Date().toISOString().split('T')[0], size: '1.0 MB' });
  };
  const handleGroupAnnouncementPost = (groupId: string) => {
      const content = prompt("Enter announcement content:");
      if(content) addGroupAnnouncement(groupId, { id: `ga-${Date.now()}`, content: content, date: new Date().toISOString().split('T')[0], authorName: 'Admin' });
  };

  // Mobile Friendly Tab Button
  const TabButton = ({ id, icon: Icon, label }: any) => (
      <button 
          onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${activeTab === id ? 'bg-blue-600 text-white shadow-lg transform translate-x-1' : 'text-slate-600 hover:bg-slate-100'}`}
      >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center px-4 justify-between shadow-sm">
          <div className="flex items-center space-x-2">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                  <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-lg text-slate-800">Admin Panel</span>
          </div>
          <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
              A
          </div>
      </div>

      {/* Sidebar (Responsive Drawer) */}
      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                  <div className="bg-slate-900 p-2 rounded-xl shadow-lg">
                    <SettingsIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">Admin</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Management</span>
                  </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 p-4">
              <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Overview</h3>
                  <nav className="space-y-1">
                      <TabButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                  </nav>
              </div>

              <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Academic</h3>
                  <nav className="space-y-1">
                      <TabButton id="courses" icon={BookOpen} label="Courses" />
                      <TabButton id="students" icon={Users} label="Students" />
                      <TabButton id="enrollments" icon={CheckCircle} label="Enrollments" />
                      <TabButton id="faculty" icon={Briefcase} label="Faculty" />
                  </nav>
              </div>

              <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Organization</h3>
                  <nav className="space-y-1">
                      <TabButton id="staff" icon={Lock} label="Staff & Access" />
                      <TabButton id="groups" icon={MessageSquare} label="Groups & Chat" />
                      <TabButton id="meetings" icon={Video} label="Live Meetings" />
                      <TabButton id="announcements" icon={Bell} label="Notices" />
                  </nav>
              </div>

               <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Content</h3>
                  <nav className="space-y-1">
                      <TabButton id="reviews" icon={Star} label="Reviews" />
                      <TabButton id="settings" icon={SettingsIcon} label="Site Settings" />
                  </nav>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden mt-16 md:mt-0 bg-slate-50/50">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize">
                        {activeTab === 'dashboard' ? 'Overview' : 
                         activeTab === 'settings' ? 'Site Settings' :
                         activeTab === 'staff' ? 'Staff & Access' :
                         `${activeTab}`}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 hidden sm:block">
                        {activeTab === 'dashboard' && 'Welcome back, Administrator.'}
                        {activeTab === 'settings' && 'Manage branding and contact info.'}
                        {activeTab !== 'dashboard' && activeTab !== 'settings' && `Manage ${activeTab} records efficiently.`}
                    </p>
                  </div>
                  
                  {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'reviews' && activeTab !== 'enrollments' && (
                      <div className="w-full sm:w-auto">
                          {(activeTab !== 'groups' || user?.role === 'admin') && (
                              <button 
                                  onClick={() => openModal('add')}
                                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                              >
                                  <Plus className="w-4 h-4" />
                                  <span>{activeTab === 'meetings' ? 'Schedule' : 'Add New'}</span>
                              </button>
                          )}
                      </div>
                  )}
              </div>

              {/* Content Views */}
              {activeTab === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in pb-10">
                      {/* Stats Cards - Grid optimized for mobile */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Students</span>
                                  <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{students.length}</div>
                          </div>
                          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Courses</span>
                                  <BookOpen className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{courses.length}</div>
                          </div>
                          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Staff</span>
                                  <Briefcase className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{faculty.length + staff.length}</div>
                          </div>
                          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Groups</span>
                                  <MessageSquare className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{groups.length}</div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Quick Actions - List style on mobile */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <button onClick={() => {setActiveTab('announcements'); openModal('add');}} className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                                      <div className="p-2 bg-white rounded-md shadow-sm mr-3 text-blue-600"><Bell className="w-5 h-5" /></div>
                                      <div className="text-left">
                                          <div className="font-bold text-slate-900 text-sm">Post Notice</div>
                                          <div className="text-xs text-slate-500">To all students</div>
                                      </div>
                                  </button>
                                  <button onClick={() => {setActiveTab('courses'); openModal('add');}} className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                                      <div className="p-2 bg-white rounded-md shadow-sm mr-3 text-purple-600"><BookOpen className="w-5 h-5" /></div>
                                      <div className="text-left">
                                          <div className="font-bold text-slate-900 text-sm">Add Course</div>
                                          <div className="text-xs text-slate-500">New program</div>
                                      </div>
                                  </button>
                                  <button onClick={() => {setActiveTab('staff'); openModal('add');}} className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group">
                                      <div className="p-2 bg-white rounded-md shadow-sm mr-3 text-orange-600"><Lock className="w-5 h-5" /></div>
                                      <div className="text-left">
                                          <div className="font-bold text-slate-900 text-sm">Add Staff</div>
                                          <div className="text-xs text-slate-500">Member access</div>
                                      </div>
                                  </button>
                                  <button onClick={() => setActiveTab('settings')} className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                                      <div className="p-2 bg-white rounded-md shadow-sm mr-3 text-slate-600"><SettingsIcon className="w-5 h-5" /></div>
                                      <div className="text-left">
                                          <div className="font-bold text-slate-900 text-sm">Settings</div>
                                          <div className="text-xs text-slate-500">Site config</div>
                                      </div>
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Data Lists: Table for Desktop, Cards for Mobile */}
              <div className={`space-y-4 ${activeTab === 'dashboard' ? 'hidden' : 'block'}`}>
                   {/* Search for Groups Tab */}
                   {activeTab === 'groups' && (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center mb-4 sticky top-0 z-10 shadow-sm">
                            <Search className="w-5 h-5 text-slate-400 mr-2" />
                            <input 
                                type="text"
                                placeholder="Search groups by name, branch, or batch ID..."
                                className="bg-transparent border-none focus:ring-0 w-full text-sm text-slate-700 placeholder-slate-400"
                                value={groupSearch}
                                onChange={(e) => setGroupSearch(e.target.value)}
                            />
                        </div>
                   )}

                   {/* Desktop Table View */}
                   <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                      {activeTab === 'courses' && <><th className="p-4 font-semibold text-sm text-slate-700">Title</th><th className="p-4 font-semibold text-sm text-slate-700">Category</th><th className="p-4 font-semibold text-sm text-slate-700">Price</th></>}
                                      {activeTab === 'announcements' && <><th className="p-4 font-semibold text-sm text-slate-700">Title</th><th className="p-4 font-semibold text-sm text-slate-700">Date</th><th className="p-4 font-semibold text-sm text-slate-700">Author</th></>}
                                      {activeTab === 'faculty' && <><th className="p-4 font-semibold text-sm text-slate-700">Name</th><th className="p-4 font-semibold text-sm text-slate-700">Specialization</th></>}
                                      {activeTab === 'students' && <><th className="p-4 font-semibold text-sm text-slate-700">Name</th><th className="p-4 font-semibold text-sm text-slate-700">Email</th><th className="p-4 font-semibold text-sm text-slate-700">Status</th></>}
                                      {activeTab === 'staff' && <><th className="p-4 font-semibold text-sm text-slate-700">Name</th><th className="p-4 font-semibold text-sm text-slate-700">Role</th><th className="p-4 font-semibold text-sm text-slate-700">Department</th><th className="p-4 font-semibold text-sm text-slate-700">Status</th></>}
                                      {activeTab === 'groups' && <><th className="p-4 font-semibold text-sm text-slate-700">Group Details</th><th className="p-4 font-semibold text-sm text-slate-700">Type</th><th className="p-4 font-semibold text-sm text-slate-700">Identifier</th></>}
                                      {activeTab === 'assignments' && <><th className="p-4 font-semibold text-sm text-slate-700">Title</th><th className="p-4 font-semibold text-sm text-slate-700">Due Date</th><th className="p-4 font-semibold text-sm text-slate-700">Status</th></>}
                                      {activeTab === 'meetings' && <><th className="p-4 font-semibold text-sm text-slate-700">Title</th><th className="p-4 font-semibold text-sm text-slate-700">Date</th><th className="p-4 font-semibold text-sm text-slate-700">Status</th><th className="p-4 font-semibold text-sm text-slate-700">Host</th></>}
                                      {activeTab === 'reviews' && <><th className="p-4 font-semibold text-sm text-slate-700">Course</th><th className="p-4 font-semibold text-sm text-slate-700">User</th><th className="p-4 font-semibold text-sm text-slate-700">Rating</th></>}
                                      {activeTab === 'enrollments' && <><th className="p-4 font-semibold text-sm text-slate-700">Student</th><th className="p-4 font-semibold text-sm text-slate-700">Course</th></>}
                                      <th className="p-4 font-semibold text-right text-sm text-slate-700">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {/* Rendering logic is mostly same as before, condensed for brevity */}
                                  {activeTab === 'staff' && staff.map(item => (
                                      <tr key={item.id} className="hover:bg-slate-50">
                                          <td className="p-4 text-sm font-medium text-slate-900">{item.name}<div className="text-xs text-slate-400">{item.email}</div></td>
                                          <td className="p-4 text-sm text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs uppercase font-bold">{item.role}</span></td>
                                          <td className="p-4 text-sm text-slate-600">{item.department}</td>
                                          <td className="p-4"><button onClick={() => handleToggleStaffStatus(item)} className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</button></td>
                                          <td className="p-4 flex justify-end space-x-2">
                                              <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 className="w-4 h-4" /></button>
                                              <button onClick={() => handleDelete('staff', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                          </td>
                                      </tr>
                                  ))}
                                  {activeTab === 'courses' && getFilteredCourses().map(item => (
                                      <tr key={item.id} className="hover:bg-slate-50">
                                          <td className="p-4 text-sm font-medium text-slate-900">{item.title}</td>
                                          <td className="p-4 text-sm text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{item.category}</span></td>
                                          <td className="p-4 text-sm text-slate-600">{item.price}</td>
                                          <td className="p-4 flex justify-end space-x-2">
                                              <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 className="w-4 h-4" /></button>
                                              <button onClick={() => handleDelete('course', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                          </td>
                                      </tr>
                                  ))}
                                  {activeTab === 'groups' && getFilteredGroups().map(item => {
                                      const styles = getGroupStyles(item.type);
                                      const Icon = styles.icon;
                                      return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} ${styles.text}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles.badgeBg} ${styles.badgeText}`}>
                                                    {item.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 font-mono text-xs">
                                                {item.branchIdentifier || item.batchIdentifier || '-'}
                                            </td>
                                            <td className="p-4 flex justify-end space-x-2">
                                                <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete('group', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                      );
                                  })}
                                  {/* ... Rest of table renderers ... */}
                              </tbody>
                          </table>
                      </div>
                   </div>

                   {/* Mobile Card View */}
                   <div className="md:hidden grid grid-cols-1 gap-4 pb-20">
                        {activeTab === 'staff' && staff.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{item.name.charAt(0)}</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                            <p className="text-xs text-slate-500">{item.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete('staff', item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {/* ... staff card details ... */}
                            </div>
                        ))}

                        {activeTab === 'groups' && getFilteredGroups().map(item => {
                            const styles = getGroupStyles(item.type);
                            const Icon = styles.icon;
                            return (
                                <div key={item.id} className={`bg-white rounded-xl shadow-sm border ${styles.border} overflow-hidden`}>
                                    <div className={`h-1.5 w-full ${item.type === 'branch' ? 'bg-indigo-500' : item.type === 'online_batch' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} ${styles.text}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${styles.badgeBg} ${styles.badgeText}`}>
                                                        {item.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 bg-slate-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete('group', item.id)} className="p-2 text-red-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                            {(item.branchIdentifier || item.batchIdentifier) && (
                                                <div className="flex items-center">
                                                    <Info className="w-3 h-3 mr-1.5" /> 
                                                    <span className="font-mono">{item.branchIdentifier || item.batchIdentifier}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Fallback for other lists to generic cards */}
                        {['courses', 'announcements', 'faculty', 'students', 'meetings', 'assignments'].includes(activeTab) && (
                            <div className="text-center text-slate-400 py-4 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                {activeTab === 'courses' && getFilteredCourses().map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 text-left">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-slate-900">{item.title}</h3>
                                            <div className="flex space-x-1">
                                                <button onClick={() => openModal('edit', item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete('course', item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-600">{item.price || 'Free'} • {item.category}</div>
                                    </div>
                                ))}
                                {/* ... other tabs mobile cards ... */}
                            </div>
                        )}
                   </div>
              </div>

              {/* Settings View */}
              {activeTab === 'settings' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 pb-20">
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center"><Star className="w-5 h-5 mr-2 text-blue-600" /> Branding</h3>
                                <div className="space-y-4">
                                    <div><label className="label">Brand Name</label><input type="text" value={settingsForm.brandName} onChange={e => setSettingsForm({...settingsForm, brandName: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Subtitle</label><input type="text" value={settingsForm.brandSubtitle} onChange={e => setSettingsForm({...settingsForm, brandSubtitle: e.target.value})} className="input-field" /></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Contact</h3>
                                <div className="space-y-4">
                                    <div><label className="label">Phone</label><input type="text" value={settingsForm.contactPhone} onChange={e => setSettingsForm({...settingsForm, contactPhone: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Email</label><input type="text" value={settingsForm.contactEmail} onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} className="input-field" /></div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSettingsSave} className="mt-8 w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700">Save All Changes</button>
                  </div>
              )}
          </div>
      </div>

      {/* Modal - Full screen on mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className={`bg-white sm:rounded-2xl shadow-2xl w-full ${activeTab === 'groups' ? 'max-w-4xl h-full sm:h-[85vh]' : 'max-w-lg h-full sm:h-auto'} flex flex-col overflow-hidden`}>
             <div className={`flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 ${activeTab === 'groups' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white' : 'bg-slate-50'}`}>
                 <div>
                    <h2 className={`text-lg sm:text-xl font-bold ${activeTab === 'groups' ? 'text-white' : 'text-slate-900'}`}>
                        {editingId ? 'Edit' : 'New'} {activeTab === 'groups' ? 'Group Space' : activeTab.slice(0, -1)}
                    </h2>
                    {activeTab === 'groups' && editingId && (
                        <p className="text-xs text-slate-300 mt-1 opacity-80">Manage members, files, and conversations</p>
                    )}
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className={`${activeTab === 'groups' ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'} p-2 rounded-full transition-colors`}><X className="w-6 h-6" /></button>
             </div>
             
             <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                 {activeTab === 'groups' ? (
                     <div className="flex flex-col h-full">
                         {/* Styled Tabs */}
                         <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
                            <div className="flex space-x-6 overflow-x-auto no-scrollbar">
                                {['details', 'files', 'members', 'announcements', 'chat'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setGroupModalTab(tab as any)} 
                                        className={`py-4 text-sm font-bold capitalize border-b-2 whitespace-nowrap transition-colors ${groupModalTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {groupModalTab === 'details' && (
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="space-y-4">
                                            <div><label className="label">Group Name</label><input type="text" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} className="input-field" placeholder="e.g. Batch 2024 Safety Officers" /></div>
                                            <div><label className="label">Description</label><textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} className="input-field" rows={3} placeholder="Describe the purpose of this group..." /></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-sm text-slate-800 mb-4 border-b pb-2">Configuration</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Type</label>
                                                <select value={groupForm.type} onChange={e => setGroupForm({...groupForm, type: e.target.value as any})} className="input-field">
                                                    <option value="general">General Group</option>
                                                    <option value="branch">Physical Branch</option>
                                                    <option value="online_batch">Online Batch</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Identifier Code</label>
                                                <input type="text" value={groupForm.branchIdentifier || ''} onChange={e => setGroupForm({...groupForm, branchIdentifier: e.target.value})} className="input-field" placeholder="e.g. DEL-001" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {groupModalTab === 'files' && editingId && (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">Files Repository</h3>
                                            <p className="text-sm text-slate-500">Manage shared documents and resources</p>
                                        </div>
                                        <button onClick={() => handleGroupFileUpload(editingId)} className="btn-primary-small flex items-center">
                                            <Upload className="w-4 h-4 mr-2" /> Upload
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {groups.find(g => g.id === editingId)?.files?.map(f => (
                                            <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-900 truncate" title={f.name}>{f.name}</div>
                                                            <div className="text-xs text-slate-500 flex items-center mt-1">
                                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-2">{f.size || '1MB'}</span>
                                                                <span>{f.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => confirmAndDeleteGroupFile(editingId, f.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">By {f.uploadedBy}</span>
                                                    <button className="text-blue-600 text-xs font-bold hover:underline flex items-center">
                                                        <Download className="w-3 h-3 mr-1" /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {!groups.find(g => g.id === editingId)?.files?.length && (
                                            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No files uploaded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {groupModalTab === 'members' && editingId && (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">Members</h3>
                                            <p className="text-sm text-slate-500">Manage access and roles</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => downloadMemberTemplate()} className="btn-secondary-small">
                                                <Download className="w-4 h-4 mr-2" /> Template
                                            </button>
                                            <label className="btn-primary-small cursor-pointer flex items-center">
                                                <Upload className="w-4 h-4 mr-2" /> Bulk Import
                                                <input type="file" ref={csvMemberInputRef} onChange={handleBulkAddMembers} accept=".csv" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                                            {[...students, ...faculty, ...staff].filter(u => groups.find(g => g.id === editingId)?.allowedRoles.includes((u as any).role || 'student')).map(m => {
                                                const groupRoles = groups.find(g => g.id === editingId)?.customRoles || [];
                                                const currentRole = groupRoles.find(r => r.userId === m.id)?.role || 'member';
                                                
                                                return (
                                                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center space-x-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {m.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 text-sm flex items-center">
                                                                    {m.name}
                                                                    {currentRole === 'admin' && <Shield className="w-3 h-3 text-indigo-600 ml-1.5" />}
                                                                </div>
                                                                <div className="text-xs text-slate-500 capitalize">{(m as any).role || 'Student'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <select 
                                                                className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                                value={currentRole}
                                                                onChange={(e) => setGroupMemberRole(editingId, m.id, e.target.value as any)}
                                                            >
                                                                <option value="member">Member</option>
                                                                <option value="coordinator">Coordinator</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                            <button onClick={() => confirmAndRemoveGroupMember(editingId, m.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {groupModalTab === 'chat' && editingId && (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-slate-800">Chat Moderation</h3>
                                        <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold">Admin View</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-inner space-y-3 min-h-[300px] max-h-[500px]">
                                        {messages[editingId]?.length > 0 ? messages[editingId].map(msg => (
                                            <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'} group`}>
                                                <div className={`max-w-[80%] min-w-[200px] relative ${msg.senderRole === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200'} p-3 rounded-2xl shadow-sm`}>
                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-1 text-xs opacity-80 border-b border-white/20 pb-1">
                                                        <span className="font-bold">{msg.senderName}</span>
                                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    {msg.type === 'file' ? (
                                                        <div className={`flex items-center space-x-2 p-2 rounded-lg mt-1 ${msg.senderRole === 'admin' ? 'bg-indigo-700' : 'bg-slate-50'}`}>
                                                            <Paperclip className="w-4 h-4" />
                                                            <span className="font-medium text-sm underline">{msg.fileName}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    )}

                                                    {/* Delete Action */}
                                                    <button 
                                                        onClick={() => { if(window.confirm('Delete message?')) deleteMessage(editingId, msg.id); }}
                                                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                                        title="Delete Message"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                                <p>No messages yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {groupModalTab === 'announcements' && editingId && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg text-slate-800">Notice Board</h3>
                                        <button onClick={() => handleGroupAnnouncementPost(editingId)} className="btn-primary-small">
                                            <Plus className="w-4 h-4 mr-2" /> Post Announcement
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {groups.find(g => g.id === editingId)?.announcements?.map(a => (
                                            <div key={a.id} className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm relative group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Bell className="w-4 h-4 text-amber-600" />
                                                        <span className="font-bold text-slate-800 text-sm">{a.authorName}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded">{a.date}</span>
                                                </div>
                                                <p className="text-slate-700 text-sm leading-relaxed">{a.content}</p>
                                                <button 
                                                    onClick={() => confirmAndDeleteGroupAnnouncement(editingId, a.id)} 
                                                    className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {!groups.find(g => g.id === editingId)?.announcements?.length && (
                                            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No announcements posted.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                         </div>
                     </div>
                 ) : (
                     /* Generic Form Container for non-group tabs */
                     <div className="p-4 sm:p-6 overflow-y-auto">
                         <div className="space-y-4 max-w-2xl mx-auto">
                            {/* Same forms as before, wrapped in nicer container implicitly by layout */}
                             {activeTab === 'staff' && (
                                 <>
                                    <div><label className="label">Name</label><input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Email</label><input type="text" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Role</label><select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value as any})} className="input-field"><option value="employee">Employee</option><option value="director">Director</option><option value="admin">Admin</option></select></div>
                                 </>
                             )}
                             {activeTab === 'courses' && (
                                 <>
                                    <div><label className="label">Title</label><input type="text" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Price</label><input type="text" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} className="input-field" /></div>
                                    <div><label className="label">Description</label><textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="input-field" rows={3}/></div>
                                 </>
                             )}
                             {/* Add other tab forms similarly if needed, keeping brevity */}
                         </div>
                     </div>
                 )}
             </div>

             <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                 <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Save Changes</button>
             </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .input-field { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; transition: all 0.2s; background: #fff; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); outline: none; }
        .btn-primary-small { @apply px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center; }
        .btn-secondary-small { @apply px-3 py-1.5 bg-white text-slate-600 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors flex items-center; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminCMS;