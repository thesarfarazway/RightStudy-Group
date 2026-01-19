import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, Video, Calendar, Book, LogOut, FileText, LayoutDashboard, Settings, Upload, Briefcase, Users, GraduationCap, CheckCircle, Clock, BookOpen, MessageSquare, Send, Paperclip, Mic, MicOff, Camera, CameraOff, PhoneOff, MoreVertical, Pin, Download, Bell, Trash2, Shield, Plus, XCircle, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole, Group } from '../types';

interface PortalProps {
    adminMode?: boolean;
}

const Portal: React.FC<PortalProps> = ({ adminMode }) => {
  const { 
      user, login, logout, assignments, submitAssignment, courses, groups, 
      messages, sendMessage, deleteMessage,
      meetings, toggleMeeting, 
      addGroupFile, deleteGroupFile, removeGroupMember, addGroupAnnouncement, deleteGroupAnnouncement,
      students, faculty, siteSettings, staff
  } = useData();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Tab State
  const initialTab = (location.state as any)?.initialTab;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'classes' | 'assignments' | 'profile' | 'groups'>('dashboard');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Admin Redirect
  useEffect(() => {
      if (user?.role === 'admin' && !adminMode) {
          navigate('/admin');
      }
  }, [user, navigate, adminMode]);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(adminMode ? 'admin' : 'student');

  // Group & Chat State
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [groupViewTab, setGroupViewTab] = useState<'chat' | 'files' | 'announcements' | 'members'>('chat');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Meeting State
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'groups' && selectedGroupId && groupViewTab === 'chat') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedGroupId, activeTab, groupViewTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email, selectedRole);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const handleAssignmentUpload = (id: string) => {
      if(confirm("Upload mock assignment file?")) {
        submitAssignment(id);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedGroupId || !chatInput.trim()) return;
      sendMessage(selectedGroupId, chatInput);
      setChatInput('');
  };

  const handleFileUpload = () => {
      if (!selectedGroupId || !user) return;
      const fileName = prompt("Enter mock file name to upload (e.g. assignment.pdf):");
      if (fileName) {
          // If in Chat tab, send as message attachment
          if (groupViewTab === 'chat') {
            sendMessage(selectedGroupId, fileName, 'file', fileName);
          } else {
             // If in Files tab, upload to repository
             addGroupFile(selectedGroupId, {
                 id: `gf-${Date.now()}`,
                 name: fileName,
                 url: '#',
                 uploadedBy: user.name,
                 uploaderRole: user.role,
                 date: new Date().toISOString().split('T')[0],
                 size: '1.2 MB'
             });
          }
      }
  };

  const handleDeleteGroupFile = (fileId: string) => {
      if (selectedGroupId && confirm("Are you sure you want to delete this file?")) {
          deleteGroupFile(selectedGroupId, fileId);
      }
  };

  const handleJoinMeeting = (groupId: string) => {
      setSelectedGroupId(groupId);
      setActiveTab('groups');
      setIsMeetingActive(true);
  };

  const handleStartMeeting = (groupId: string) => {
      const title = prompt("Enter meeting title:", "Live Class");
      if (title) {
          toggleMeeting(groupId, true, title);
          setIsMeetingActive(true);
      }
  };

  // --- Group Admin Helpers ---
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const currentGroupRole = selectedGroup?.customRoles?.find(r => r.userId === user?.id)?.role;
  const isGroupAdmin = user?.role === 'admin' || currentGroupRole === 'admin' || currentGroupRole === 'coordinator';
  const isSuperAdmin = user?.role === 'admin' || currentGroupRole === 'admin'; // Only super admin or group admin can do critical things

  const handlePostAnnouncement = () => {
      if (!selectedGroupId) return;
      const content = prompt("Enter announcement content:");
      if (content) {
          addGroupAnnouncement(selectedGroupId, {
              id: `ga-${Date.now()}`,
              content,
              date: new Date().toISOString().split('T')[0],
              authorName: user?.name || 'Admin'
          });
      }
  };

  const handleDeleteAnnouncement = (id: string) => {
      if(selectedGroupId && confirm("Delete this announcement?")) {
          deleteGroupAnnouncement(selectedGroupId, id);
      }
  };

  const handleRemoveMember = (userId: string) => {
      if(selectedGroupId && confirm("Remove this member from the group?")) {
          removeGroupMember(selectedGroupId, userId);
      }
  };
  
  const handleDeleteMessage = (msgId: string) => {
      if(selectedGroupId && confirm("Delete this message?")) {
          deleteMessage(selectedGroupId, msgId);
      }
  };

  const getRoleIcon = () => {
      switch(selectedRole) {
          case 'director': return <Briefcase className="w-8 h-8 text-white" />;
          case 'shareholder': return <Users className="w-8 h-8 text-white" />;
          case 'teacher': return <Book className="w-8 h-8 text-white" />;
          case 'student': return <GraduationCap className="w-8 h-8 text-white" />;
          case 'employee': return <Briefcase className="w-8 h-8 text-white" />;
          case 'admin': return <Shield className="w-8 h-8 text-white" />;
          default: return <Lock className="w-8 h-8 text-white" />;
      }
  };

  // Filter groups available to the user
  const myGroups = user ? groups.filter(g => {
    // 1. Check if user is banned
    if (g.excludedUserIds?.includes(user.id)) return false;

    // 2. If group has a whitelist (memberIds), strict check unless admin/director
    if (g.memberIds && g.memberIds.length > 0) {
        if (user.role === 'admin' || user.role === 'director' || user.role === 'shareholder') return true;
        return g.memberIds.includes(user.id);
    }

    // 3. Fallback to Role-based check
    return g.allowedRoles.includes(user.role);
  }) : [];

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full my-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${selectedRole === 'student' ? 'bg-blue-600' : selectedRole === 'admin' ? 'bg-slate-900' : 'bg-slate-700'}`}>
              {getRoleIcon()}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{siteSettings.portalTitle}</h2>
            <p className="text-slate-500">{siteSettings.portalSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Login Category</label>
                <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="employee">Working Employee</option>
                    <option value="director">Board of Director</option>
                    <option value="shareholder">Share Holder</option>
                    <option value="admin">System Administrator</option>
                </select>
             </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="name@rightstudy.com"
                />
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center transform hover:-translate-y-0.5 ${selectedRole === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
              {loading ? 'Authenticating...' : `Access ${selectedRole === 'admin' ? 'Admin Panel' : 'Portal'}`}
            </button>
          </form>
          {selectedRole === 'student' && (
              <div className="mt-4 text-center text-xs text-slate-400">
                  New student? Contact admission office for login credentials.
              </div>
          )}
        </div>
      </div>
    );
  }

  // Render Portal Interface
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 md:h-screen sticky top-0 md:flex flex-col hidden">
          <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                      {user.name.charAt(0)}
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 truncate w-32">{user.name}</h3>
                      <span className="text-xs text-slate-500 uppercase">{user.role}</span>
                  </div>
              </div>
              <nav className="space-y-1">
                  <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                  </button>
                  {user.role === 'student' && (
                      <>
                        <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">My Courses</span>
                        </button>
                        <button onClick={() => setActiveTab('assignments')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assignments' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">Assignments</span>
                        </button>
                      </>
                  )}
                  <button onClick={() => setActiveTab('groups')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'groups' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Groups & Chat</span>
                  </button>
                  <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                  </button>
              </nav>
          </div>
          <div className="mt-auto p-6 border-t border-slate-100">
              <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
              </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-80px)] md:h-screen">
          {/* Mobile Tab Nav */}
          <div className="md:hidden flex overflow-x-auto space-x-2 mb-6 pb-2">
              {['dashboard', user.role === 'student' ? 'courses' : null, 'groups', user.role === 'student' ? 'assignments' : null, 'profile'].filter(Boolean).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                      {tab!.charAt(0).toUpperCase() + tab!.slice(1)}
                  </button>
              ))}
          </div>

          {activeTab === 'dashboard' && (
              <div className="max-w-4xl">
                  <h1 className="text-2xl font-bold text-slate-900 mb-6">Welcome back, {user.name}</h1>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {user.role === 'student' ? (
                          <>
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-1">Enrolled Courses</div>
                                <div className="text-3xl font-bold text-slate-900">{user.enrolledCourses.length}</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-1">Pending Assignments</div>
                                <div className="text-3xl font-bold text-slate-900">{assignments.filter(a => a.status === 'Pending').length}</div>
                            </div>
                          </>
                      ) : (
                          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm col-span-2">
                              <div className="text-slate-500 text-sm font-medium mb-1">Role Status</div>
                              <div className="text-3xl font-bold text-slate-900 capitalize">{user.role}</div>
                          </div>
                      )}
                      
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-slate-500 text-sm font-medium mb-1">Active Groups</div>
                          <div className="text-3xl font-bold text-slate-900">{myGroups.length}</div>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-slate-500 text-sm font-medium mb-1">System Status</div>
                          <div className="text-3xl font-bold text-green-600">Active</div>
                      </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                      <h2 className="font-bold text-lg text-slate-900 mb-4">Recent Notices</h2>
                      <div className="space-y-4">
                          {/* Global Notices */}
                          {useData().announcements.slice(0, 2).map(ann => (
                              <div key={ann.id} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                                  <Bell className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                  <div>
                                      <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                                      <p className="text-slate-600 text-sm mt-1">{ann.content}</p>
                                      <span className="text-xs text-slate-400 mt-2 block">{ann.date} • {ann.author}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'groups' && (
              <div className="h-full flex flex-col md:flex-row gap-6">
                  {/* Group List */}
                  <div className={`w-full md:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${selectedGroupId && 'hidden md:flex'}`}>
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <h2 className="font-bold text-slate-800">Your Groups</h2>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                          {myGroups.map(group => {
                              const meeting = meetings.find(m => m.groupId === group.id && m.isLive);
                              return (
                                  <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selectedGroupId === group.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                  >
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="font-bold text-slate-900 text-sm truncate pr-2">{group.name}</span>
                                          {meeting && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 mt-1.5" title="Live Meeting"></span>}
                                      </div>
                                      <p className="text-xs text-slate-500 truncate">{group.description}</p>
                                  </button>
                              );
                          })}
                          {myGroups.length === 0 && (
                              <div className="p-8 text-center text-slate-500 text-sm">
                                  You are not part of any groups yet.
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Group Chat / Content Area */}
                  {selectedGroupId ? (
                      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px] md:h-auto relative">
                           {/* Meeting Overlay */}
                           {isMeetingActive && (
                               <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col">
                                   <div className="p-4 flex justify-between items-center text-white bg-slate-800">
                                        <div className="flex items-center space-x-2">
                                            <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
                                            <span className="font-bold">Live: {meetings.find(m => m.groupId === selectedGroupId)?.title || 'Meeting'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-slate-700 px-3 py-1 rounded-full text-xs">
                                                {meetings.find(m => m.groupId === selectedGroupId)?.participants || 1} Participants
                                            </div>
                                        </div>
                                   </div>
                                   <div className="flex-1 flex items-center justify-center relative">
                                        {/* Mock Video Grid */}
                                        <div className="grid grid-cols-2 gap-4 p-4 w-full h-full max-w-4xl">
                                            <div className="bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-700">
                                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">You</div>
                                                {!micOn && <MicOff className="absolute top-4 right-4 text-red-500 w-5 h-5" />}
                                            </div>
                                            <div className="bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-700">
                                                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">T</div>
                                                <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">Teacher</div>
                                            </div>
                                        </div>
                                   </div>
                                   <div className="p-6 bg-slate-800 flex justify-center space-x-6">
                                       <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full ${micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white'}`}>
                                           {micOn ? <Mic /> : <MicOff />}
                                       </button>
                                       <button onClick={() => setCamOn(!camOn)} className={`p-4 rounded-full ${camOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white'}`}>
                                           {camOn ? <Camera /> : <CameraOff />}
                                       </button>
                                       <button onClick={() => setIsMeetingActive(false)} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700">
                                           <PhoneOff />
                                       </button>
                                   </div>
                               </div>
                           )}

                           {/* Header */}
                           <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                               <div className="flex items-center space-x-3">
                                   <button onClick={() => setSelectedGroupId(null)} className="md:hidden text-slate-500"><XCircle className="w-6 h-6" /></button>
                                   <div>
                                       <h2 className="font-bold text-slate-900">{selectedGroup?.name}</h2>
                                       {currentGroupRole && (
                                           <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                                               currentGroupRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                                               currentGroupRole === 'coordinator' ? 'bg-purple-100 text-purple-700' : 
                                               'bg-slate-200 text-slate-600'
                                           }`}>
                                               {currentGroupRole}
                                           </span>
                                       )}
                                   </div>
                               </div>
                               <div className="flex items-center space-x-2">
                                   {(user.role === 'teacher' || isGroupAdmin) && (
                                       <button onClick={() => handleStartMeeting(selectedGroupId)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Start Meeting">
                                           <Video className="w-5 h-5" />
                                       </button>
                                   )}
                                   {meetings.find(m => m.groupId === selectedGroupId && m.isLive) && !isMeetingActive && (
                                       <button onClick={() => handleJoinMeeting(selectedGroupId)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                           Join Live
                                       </button>
                                   )}
                               </div>
                           </div>

                           {/* Group Tabs */}
                           <div className="flex border-b border-slate-200 bg-white">
                               {['chat', 'files', 'announcements', 'members'].map(tab => (
                                   <button 
                                     key={tab}
                                     onClick={() => setGroupViewTab(tab as any)}
                                     className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${groupViewTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                                   >
                                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                   </button>
                               ))}
                           </div>

                           {/* Content based on Tab */}
                           <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
                               {groupViewTab === 'chat' && (
                                   <div className="space-y-4">
                                       {messages[selectedGroupId]?.map((msg) => (
                                           <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                               <div className={`max-w-[80%] ${msg.senderId === user.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                                   <div className="flex items-center space-x-2 mb-1">
                                                       <span className="text-xs font-bold text-slate-600">{msg.senderName}</span>
                                                       <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                       {/* Moderation: Delete Message */}
                                                       {isGroupAdmin && (
                                                           <button onClick={() => handleDeleteMessage(msg.id)} className="text-slate-300 hover:text-red-500" title="Delete Message">
                                                               <Trash2 className="w-3 h-3" />
                                                           </button>
                                                       )}
                                                   </div>
                                                   <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                                                       msg.senderId === user.id 
                                                       ? 'bg-blue-600 text-white rounded-tr-none' 
                                                       : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                                   }`}>
                                                       {msg.type === 'file' ? (
                                                           <div className="flex items-center space-x-2">
                                                               <FileText className="w-5 h-5" />
                                                               <span className="underline cursor-pointer">{msg.fileName}</span>
                                                           </div>
                                                       ) : (
                                                           <p>{msg.content}</p>
                                                       )}
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                       <div ref={chatEndRef} />
                                   </div>
                               )}

                               {groupViewTab === 'files' && (
                                   <div className="space-y-2">
                                       <div className="flex justify-between mb-4">
                                           <h3 className="font-bold text-slate-700">Shared Files</h3>
                                           <button onClick={handleFileUpload} className="text-sm flex items-center text-blue-600 font-medium hover:underline">
                                               <Upload className="w-4 h-4 mr-1" /> Upload
                                           </button>
                                       </div>
                                       {selectedGroup?.files?.map(file => (
                                           <div key={file.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                                               <div className="flex items-center space-x-3">
                                                   <div className="p-2 bg-blue-50 rounded text-blue-600"><FileText className="w-5 h-5" /></div>
                                                   <div>
                                                       <div className="font-medium text-sm text-slate-900">{file.name}</div>
                                                       <div className="text-xs text-slate-500">{file.date} • {file.uploadedBy}</div>
                                                   </div>
                                               </div>
                                               <div className="flex space-x-2">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600"><Download className="w-4 h-4" /></button>
                                                    {/* Moderation: Delete File */}
                                                    {isGroupAdmin && (
                                                        <button onClick={() => handleDeleteGroupFile(file.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    )}
                                               </div>
                                           </div>
                                       ))}
                                       {(!selectedGroup?.files || selectedGroup.files.length === 0) && (
                                           <div className="text-center text-slate-500 py-8 italic">No files shared yet.</div>
                                       )}
                                   </div>
                               )}

                               {groupViewTab === 'announcements' && (
                                   <div className="space-y-4">
                                       <div className="flex justify-between items-center mb-2">
                                           <h3 className="font-bold text-slate-700">Group Notices</h3>
                                           {/* Moderation: Post Announcement */}
                                           {isGroupAdmin && (
                                               <button onClick={handlePostAnnouncement} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center">
                                                   <Plus className="w-3 h-3 mr-1" /> Post
                                               </button>
                                           )}
                                       </div>
                                       {selectedGroup?.announcements?.map(ann => (
                                           <div key={ann.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 relative">
                                               {isGroupAdmin && (
                                                   <button onClick={() => handleDeleteAnnouncement(ann.id)} className="absolute top-2 right-2 text-yellow-600 hover:text-red-600">
                                                       <Trash2 className="w-4 h-4" />
                                                   </button>
                                               )}
                                               <div className="flex items-center space-x-2 mb-2">
                                                   <Pin className="w-4 h-4 text-yellow-600" />
                                                   <span className="font-bold text-slate-800 text-sm">{ann.authorName}</span>
                                                   <span className="text-xs text-slate-400">• {ann.date}</span>
                                               </div>
                                               <p className="text-slate-700 text-sm">{ann.content}</p>
                                           </div>
                                       ))}
                                        {(!selectedGroup?.announcements || selectedGroup.announcements.length === 0) && (
                                           <div className="text-center text-slate-500 py-8 italic">No announcements.</div>
                                       )}
                                   </div>
                               )}

                               {groupViewTab === 'members' && (
                                   <div className="space-y-2">
                                       <h3 className="font-bold text-slate-700 mb-4">Members</h3>
                                       {/* List of members: combining students/faculty/staff for demo */}
                                       {[...students, ...faculty, ...staff].filter(p => {
                                           // Basic filter to show members who should be in this group
                                           if (selectedGroup?.memberIds?.length) return selectedGroup.memberIds.includes(p.id) || (p as any).role === 'admin';
                                           return selectedGroup?.allowedRoles.includes((p as any).role || ((p as any).specialization ? 'teacher' : 'student'));
                                       }).map(member => {
                                            const roleInGroup = selectedGroup?.customRoles?.find(r => r.userId === member.id)?.role;
                                            return (
                                                <div key={member.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-slate-900 flex items-center">
                                                                {member.name}
                                                                {roleInGroup === 'admin' && <Shield className="w-3 h-3 text-indigo-600 ml-1" />}
                                                                {roleInGroup === 'coordinator' && <Shield className="w-3 h-3 text-purple-600 ml-1" />}
                                                            </div>
                                                            <div className="text-xs text-slate-500 capitalize">
                                                                {(member as any).role || 'Student'} 
                                                                {roleInGroup ? ` • ${roleInGroup}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSuperAdmin && member.id !== user.id && (
                                                        <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50">
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                       })}
                                   </div>
                               )}
                           </div>

                           {/* Chat Input */}
                           {groupViewTab === 'chat' && (
                               <div className="p-3 bg-white border-t border-slate-200">
                                   <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                       <button type="button" onClick={handleFileUpload} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-full">
                                           <Paperclip className="w-5 h-5" />
                                       </button>
                                       <input
                                           type="text"
                                           value={chatInput}
                                           onChange={(e) => setChatInput(e.target.value)}
                                           placeholder="Type a message..."
                                           className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       />
                                       <button type="submit" disabled={!chatInput.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50">
                                           <Send className="w-5 h-5" />
                                       </button>
                                   </form>
                               </div>
                           )}
                      </div>
                  ) : (
                      <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-center text-slate-400">
                              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">Select a group to start chatting</p>
                          </div>
                      </div>
                  )}
              </div>
          )}
          
          {/* Other simple tabs */}
          {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.filter(c => user.enrolledCourses.includes(c.id)).map(course => (
                      <div key={course.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                          </div>
                          <div className="flex justify-between text-sm text-slate-500 mb-4">
                              <span>35% Complete</span>
                              <span>12/40 Modules</span>
                          </div>
                          <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Continue Learning</button>
                      </div>
                  ))}
                  {user.enrolledCourses.length === 0 && (
                      <div className="col-span-3 text-center py-10 text-slate-500">
                          No active courses. <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/courses')}>Browse Catalog</span>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'assignments' && (
              <div className="space-y-4">
                  {assignments.filter(a => user.enrolledCourses.includes(a.courseId)).map(assign => (
                      <div key={assign.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center">
                           <div className="mb-4 sm:mb-0">
                               <h3 className="font-bold text-slate-900">{assign.title}</h3>
                               <p className="text-sm text-slate-500">Course: {courses.find(c => c.id === assign.courseId)?.title}</p>
                               <div className="flex items-center mt-2 text-xs">
                                   <Clock className="w-3 h-3 mr-1" /> Due: {assign.dueDate}
                               </div>
                           </div>
                           <div className="flex items-center space-x-3">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                   assign.status === 'Submitted' ? 'bg-green-100 text-green-700' : 
                                   assign.status === 'Graded' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                               }`}>
                                   {assign.status}
                               </span>
                               {assign.status === 'Pending' && (
                                   <button onClick={() => handleAssignmentUpload(assign.id)} className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
                                       <Upload className="w-4 h-4 mr-2" /> Submit
                                   </button>
                                )}
                           </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'profile' && (
              <div className="max-w-2xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-6 mb-8">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
                          {user.name.charAt(0)}
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                          <p className="text-slate-500">{user.email}</p>
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                              {user.role}
                          </span>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input type="text" value={user.name} disabled className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                          <input type="text" value={user.email} disabled className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                          <input type="text" value="+91 ***** *****" disabled className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                          <input type="text" value={user.id.toUpperCase()} disabled className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-500" />
                      </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                      <h3 className="font-bold text-slate-900 mb-4">Account Settings</h3>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium block mb-2">Change Password</button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium block">Notification Preferences</button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Portal;