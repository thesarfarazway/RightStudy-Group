import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseType, SubCategory } from '../types';
import { Search, Filter, ArrowUpDown, TrendingUp, IndianRupee } from 'lucide-react';
import { useData } from '../context/DataContext';

const Courses: React.FC = () => {
  const { courses, siteSettings } = useData();
  const [filter, setFilter] = useState<CourseType | 'ALL'>('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState<SubCategory | 'ALL'>('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'price_asc' | 'price_desc' | 'popularity' | 'default'>('default');

  const technicalSubCategories: SubCategory[] = ['Fire & Safety', 'Industrial Safety', 'Construction', 'Environmental', 'Management'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = filter === 'ALL' || course.category === filter;
    const matchesSubCategory = subCategoryFilter === 'ALL' || course.subCategory === subCategoryFilter;
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    
    let matchesPrice = true;
    const p = course.priceValue || 0;
    if (priceFilter === 'LOW') matchesPrice = p < 10000;
    else if (priceFilter === 'MEDIUM') matchesPrice = p >= 10000 && p <= 25000;
    else if (priceFilter === 'HIGH') matchesPrice = p > 25000;

    // Only apply subcategory filter if main category is Technical or ALL (implied)
    if (filter === CourseType.TECHNICAL && subCategoryFilter !== 'ALL') {
        return matchesCategory && matchesSubCategory && matchesSearch && matchesPrice;
    }
    return matchesCategory && matchesSearch && matchesPrice;
  }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
      if (sortBy === 'price_asc') return (a.priceValue || 0) - (b.priceValue || 0);
      if (sortBy === 'price_desc') return (b.priceValue || 0) - (a.priceValue || 0);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      return 0;
  });

  const handleCategoryChange = (type: CourseType | 'ALL') => {
      setFilter(type);
      setSubCategoryFilter('ALL'); // Reset subcategory when main category changes
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{siteSettings.coursesTitle}</h1>
          <p className="mt-4 text-xl text-slate-600">{siteSettings.coursesSubtitle}</p>
        </div>

        {/* Controls Container */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 space-y-4">
            {/* Top Row: Main Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                    {['ALL', CourseType.TECHNICAL, CourseType.SCHOOL, CourseType.DEGREE].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleCategoryChange(type as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === type 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {type === 'ALL' ? 'All Courses' : type.replace('_', ' ')}
                    </button>
                    ))}
                </div>
                
                <div className="relative w-full md:w-64">
                    <input
                    type="text"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {/* Bottom Row: Sub-filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-4 flex-wrap">
                {/* Sub-Category Filter (Visible mostly for Technical) */}
                {(filter === 'ALL' || filter === CourseType.TECHNICAL) && (
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">Specialization:</span>
                        <select 
                            value={subCategoryFilter}
                            onChange={(e) => setSubCategoryFilter(e.target.value as any)}
                            className="border border-slate-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">All Specializations</option>
                            {technicalSubCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div className="flex items-center space-x-2">
                     <IndianRupee className="w-4 h-4 text-slate-400" />
                     <span className="text-sm text-slate-500">Price:</span>
                     <select 
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value as any)}
                        className="border border-slate-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="ALL">Any Price</option>
                        <option value="LOW">Under ₹10k</option>
                        <option value="MEDIUM">₹10k - ₹25k</option>
                        <option value="HIGH">Above ₹25k</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2 sm:ml-auto">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-slate-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="default">Relevance</option>
                        <option value="popularity">Popularity</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="title">Name (A-Z)</option>
                        <option value="duration">Duration</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
              <div className="h-56 relative overflow-hidden">
                 <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                   {course.category}
                 </div>
                 {course.popularity && course.popularity > 90 && (
                     <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center">
                         <TrendingUp className="w-3 h-3 mr-1" /> Best Seller
                     </div>
                 )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{course.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {course.duration}
                    </span>
                    {course.subCategory && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {course.subCategory}
                        </span>
                    )}
                </div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed flex-grow line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="font-bold text-slate-900">
                        {course.price || 'Free'}
                    </div>
                    <Link to={`/courses/${course.id}`} className="text-blue-600 font-medium hover:text-blue-800 text-sm">
                        View Details &rarr;
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg">No courses found matching your criteria.</p>
            <button onClick={() => {setFilter('ALL'); setSearch(''); setSubCategoryFilter('ALL'); setPriceFilter('ALL')}} className="mt-4 text-blue-600 hover:underline">
                Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
