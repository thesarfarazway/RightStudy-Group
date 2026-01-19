import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Clock, CheckCircle, ArrowLeft, BookOpen, Shield, PlayCircle, PauseCircle, Share2, Facebook, Twitter, Linkedin, ChevronDown, ChevronUp, MessageSquare, Send, Loader2, Sparkles, Star } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, user, enrollInCourse, reviews, addReview, siteSettings } = useData();
  const navigate = useNavigate();
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // AI Chat States
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
      {role: 'model', text: 'Hi! I am your AI Assistant for this course. Ask me anything about the syllabus, career prospects, or requirements.'}
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Course not found</h2>
            <Link to="/courses" className="text-blue-600 hover:underline">Back to Courses</Link>
        </div>
    );
  }

  const isEnrolled = user?.enrolledCourses.includes(course.id);
  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const avgRating = courseReviews.length > 0 ? (courseReviews.reduce((acc, curr) => acc + curr.rating, 0) / courseReviews.length).toFixed(1) : 'N/A';

  const handleEnroll = () => {
    if (!user) {
        navigate('/portal');
        return;
    }
    enrollInCourse(course.id);
    setEnrolledSuccess(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      addReview({
          id: `rev-${Date.now()}`,
          courseId: course.id,
          userId: user.id,
          userName: user.name,
          rating: reviewRating,
          comment: reviewComment,
          date: new Date().toISOString().split('T')[0]
      });
      setReviewComment('');
      setReviewRating(5);
  };

  const handleSendChat = async () => {
      if (!chatInput.trim() || !process.env.API_KEY) return;
      
      const userMessage = chatInput;
      setChatInput('');
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setIsChatLoading(true);

      try {
          if (!chatSessionRef.current) {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              chatSessionRef.current = ai.chats.create({
                  model: 'gemini-3-pro-preview',
                  config: {
                      systemInstruction: `You are an expert tutor for the course "${course.title}" at RightStudy. 
                      Course Description: ${course.description}. 
                      Syllabus: ${course.syllabus?.join(', ')}. 
                      Duration: ${course.duration}.
                      Answer student questions specifically about this course material and career outcomes. Be encouraging and concise.`
                  }
              });
          }

          const result = await chatSessionRef.current.sendMessageStream({ message: userMessage });
          
          setMessages(prev => [...prev, { role: 'model', text: '' }]);
          let fullText = '';
          
          for await (const chunk of result) {
              const c = chunk as GenerateContentResponse;
              if (c.text) {
                  fullText += c.text;
                  setMessages(prev => {
                      const newArr = [...prev];
                      newArr[newArr.length - 1].text = fullText;
                      return newArr;
                  });
              }
          }
      } catch (error) {
          console.error("Chat error", error);
          setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't connect. Please try again." }]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const shareUrl = window.location.href;
  const shareText = `Check out ${course.title} at RightStudy!`;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src={course.image} alt="bg" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/courses" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-wider mb-2 inline-block">
                        {course.category} {course.subCategory ? `• ${course.subCategory}` : ''}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{course.title}</h1>
                    <div className="flex items-center text-slate-300 text-lg space-x-6">
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center text-yellow-400">
                            <span className="font-bold flex items-center">
                                <Star className="w-5 h-5 fill-current mr-1" /> 
                                {avgRating !== 'N/A' ? avgRating : 'New'} 
                                <span className="text-slate-400 font-normal ml-1 text-sm">({courseReviews.length} reviews)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Responsive Video Player with Play/Pause Overlay */}
                {course.videoUrl && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
                        <div className="relative w-full pb-[56.25%] bg-black group">
                            {!isPlaying ? (
                                <div 
                                    className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    <img 
                                        src={course.image} 
                                        alt="Course Preview" 
                                        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-50 transition-all duration-500" 
                                    />
                                    <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
                                        <PlayCircle className="w-20 h-20 text-white drop-shadow-2xl" />
                                        <span className="mt-2 text-white font-bold text-sm bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
                                            Watch Preview
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 w-full h-full">
                                    <iframe 
                                        src={`${course.videoUrl}?autoplay=1`}
                                        title="Course Preview" 
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                    {/* Pause/Stop Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                                            className="pointer-events-auto bg-white/20 backdrop-blur-md hover:bg-red-600 text-white p-4 rounded-full transform hover:scale-110 transition-all duration-200 border border-white/30 shadow-2xl"
                                            title="Stop Preview"
                                        >
                                            <PauseCircle className="w-12 h-12" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Course Overview</h2>
                        
                        {/* Social Share */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500 mr-1 hidden sm:inline"><Share2 className="w-4 h-4 inline" /> Share:</span>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 p-1"><Facebook className="w-5 h-5" /></a>
                            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-700 p-1"><Twitter className="w-5 h-5" /></a>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 p-1"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg mb-6">
                        {course.description}
                    </p>
                </div>
                
                {/* Dedicated Syllabus Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <BookOpen className="w-6 h-6 mr-3 text-blue-600" /> 
                        What You'll Learn
                    </h2>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        {course.syllabus && course.syllabus.length > 0 ? (
                             <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                {course.syllabus.map((item, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                             </ul>
                        ) : (
                            <div className="text-center py-8 text-slate-500 italic">
                                Detailed syllabus is available in the downloadable brochure or upon request.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Tutor Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                    <button 
                        onClick={() => setIsAiOpen(!isAiOpen)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        <div className="flex items-center space-x-3">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="font-bold text-lg">AI Course Tutor</span>
                            <span className="text-blue-100 text-sm hidden sm:inline">- Ask about this specific course</span>
                        </div>
                        {isAiOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {isAiOpen && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 h-96 flex flex-col">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 border border-slate-200 shadow-sm">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. What jobs can I get after this?"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                />
                                <button 
                                    onClick={handleSendChat}
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQ Section */}
                {course.faqs && course.faqs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {course.faqs.map((faq, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-lg">
                                    <button 
                                        onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                                        className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
                                    >
                                        <span>{faq.question}</span>
                                        {activeAccordion === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                    </button>
                                    {activeAccordion === idx && (
                                        <div className="px-4 pb-4 text-slate-600 text-sm">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Reviews Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Student Reviews</h2>
                    
                    {/* Add Review Form */}
                    {isEnrolled && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                            <h3 className="font-semibold text-slate-900 mb-4">Leave a Rating</h3>
                            <form onSubmit={handleSubmitReview}>
                                <div className="mb-4">
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className="focus:outline-none"
                                            >
                                                <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Write your experience..."
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Submit Review</button>
                            </form>
                        </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-6">
                        {courseReviews.length > 0 ? courseReviews.map(review => (
                            <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {review.userName.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-900">{review.userName}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{review.date}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm">{review.comment}</p>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 py-6">
                                No reviews yet. {isEnrolled ? 'Be the first to review!' : ''}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Certification</h2>
                    <div className="flex items-start gap-4">
                        <Shield className="w-12 h-12 text-blue-600 flex-shrink-0" />
                        <div>
                            <p className="text-slate-600">
                                {siteSettings.certificationText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-lg mb-6 shadow-sm" />
                    
                    {enrolledSuccess || isEnrolled ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-green-800">Enrolled Successfully!</h3>
                            <p className="text-green-600 text-sm mb-4">Check your portal for study materials.</p>
                            <Link to="/portal" className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                                Go to Student Portal
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <p className="text-sm text-slate-500 mb-1">Total Course Fee</p>
                                <p className="text-3xl font-bold text-slate-900">{course.price || 'Contact Us'} <span className="text-sm font-normal text-slate-500">{course.price ? '/ year' : ''}</span></p>
                            </div>
                            <button 
                                onClick={handleEnroll}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center mb-4"
                            >
                                <BookOpen className="w-5 h-5 mr-2" /> Enroll Now
                            </button>
                            <p className="text-xs text-center text-slate-500">
                                {user ? 'Clicking enroll adds this to your portal immediately.' : 'You will be asked to login first.'}
                            </p>
                        </>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Lectures</span>
                            <span className="font-medium">120+</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Language</span>
                            <span className="font-medium">English / Hindi</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Access</span>
                            <span className="font-medium">Lifetime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;