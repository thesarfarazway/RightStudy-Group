import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, TrendingUp, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';

const Home: React.FC = () => {
  const { siteSettings, courses } = useData();

  // Get top 3 popular courses (or just first 3 if popularity not set)
  const featuredCourses = [...courses]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${siteSettings.heroImage}')` }}></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" /> {siteSettings.heroSubtitle}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight whitespace-pre-wrap">
              {siteSettings.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
              {siteSettings.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/courses" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all shadow-lg hover:shadow-blue-500/25">
                Explore Courses
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/portal" state={{ initialTab: 'groups' }} className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 bg-slate-800/50 backdrop-blur-sm text-base font-bold rounded-lg text-white hover:bg-slate-700 md:text-lg transition-all hover:border-slate-500">
                <Users className="mr-2 w-5 h-5 text-blue-400" />
                Join Groups
              </Link>
              <Link to="/portal" className="inline-flex items-center justify-center px-8 py-4 border border-slate-500 text-base font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 md:text-lg transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About / Affiliations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm text-blue-600 font-bold tracking-wide uppercase">{siteSettings.aboutSubtitle}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {siteSettings.aboutTitle}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
                {siteSettings.aboutDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{siteSettings.feature1Title}</h3>
              <p className="text-slate-600 leading-relaxed">{siteSettings.feature1Desc}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 hover:-rotate-6 transition-transform">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{siteSettings.feature2Title}</h3>
              <p className="text-slate-600 leading-relaxed">{siteSettings.feature2Desc}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{siteSettings.feature3Title}</h3>
              <p className="text-slate-600 leading-relaxed">{siteSettings.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
               <h2 className="text-3xl font-bold text-slate-900">{siteSettings.featuredSectionTitle}</h2>
               <p className="text-slate-600 mt-2 text-lg">{siteSettings.featuredSectionSubtitle}</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-bold group">
              View all courses <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {featuredCourses.map((course) => (
               <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                 <div className="h-56 overflow-hidden relative">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {course.category && (
                        <span className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-800">
                            {course.category}
                        </span>
                    )}
                 </div>
                 <div className="p-6 flex-1 flex flex-col">
                   <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                   <p className="text-slate-600 mb-4 text-sm leading-relaxed flex-1 line-clamp-3">{course.description}</p>
                   <Link to={`/courses/${course.id}`} className="text-blue-600 font-bold hover:text-blue-800 text-sm uppercase tracking-wide mt-auto inline-flex items-center">
                       Learn More <ArrowRight className="ml-1 w-4 h-4" />
                   </Link>
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link to="/courses" className="inline-block px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">View all courses</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
