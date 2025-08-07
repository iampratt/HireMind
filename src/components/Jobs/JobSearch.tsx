import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, ExternalLink, Users, Star, RefreshCw } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { Job, JobFilters } from '../../types';

interface JobSearchProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({ showToast }) => {
  const [searchTerms, setSearchTerms] = useState({ keywords: '', location: '' });
  const [filters, setFilters] = useState<JobFilters>({
    keywords: '',
    location: '',
    experienceLevel: '',
    jobType: '',
    workSchedule: '',
    postedWithin: '',
    simplifiedApplication: false,
    lessThan10Applicants: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search');
  const [totalResults, setTotalResults] = useState(0);
  const [resumes, setResumes] = useState<Array<{ id: string; fileName: string }>>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await apiService.getResumes();
      if (response.success && response.data) {
        setResumes(response.data.map((resume: any) => ({
          id: resume.id,
          fileName: resume.fileName
        })));
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams = {
        keywords: searchTerms.keywords || filters.keywords,
        location: searchTerms.location || filters.location,
        experienceLevel: filters.experienceLevel,
        jobType: filters.jobType,
        workSchedule: filters.workSchedule,
        postedWithin: filters.postedWithin,
        simplifiedApplication: filters.simplifiedApplication,
        lessThan10Applicants: filters.lessThan10Applicants,
        resumeId: selectedResumeId || undefined
      };

      const response = await apiService.searchJobs(searchParams);
      
      if (response.success && response.data) {
        const formattedJobs: Job[] = response.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          postTime: job.postTime,
          jobUrl: job.jobUrl,
          description: job.description || '',
          requirements: job.requirements || [],
          salary: job.salary,
          type: job.type || 'Full-time',
          workSchedule: job.workSchedule || 'On-site',
          experienceLevel: job.experienceLevel || 'Not specified',
          simplifiedApplication: job.simplifiedApplication || false,
          applicantCount: job.applicantCount || 0
        }));
        
        setJobs(formattedJobs);
        setTotalResults(response.data.totalResults || formattedJobs.length);
        showToast(`Found ${formattedJobs.length} jobs matching your criteria`, 'success');
      } else {
        showToast('Failed to search jobs. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('An error occurred while searching jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await apiService.getJobRecommendations(selectedResumeId || undefined);
      
      if (response.success && response.data) {
        const formattedJobs: Job[] = response.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          postTime: job.postTime,
          jobUrl: job.jobUrl,
          description: job.description || '',
          requirements: job.requirements || [],
          salary: job.salary,
          type: job.type || 'Full-time',
          workSchedule: job.workSchedule || 'On-site',
          experienceLevel: job.experienceLevel || 'Not specified',
          simplifiedApplication: job.simplifiedApplication || false,
          applicantCount: job.applicantCount || 0
        }));
        
        setRecommendations(formattedJobs);
        showToast(`Found ${formattedJobs.length} job recommendations`, 'success');
      } else {
        showToast('Failed to get job recommendations. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      showToast('An error occurred while getting recommendations. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keywords: '',
      location: '',
      experienceLevel: '',
      jobType: '',
      workSchedule: '',
      postedWithin: '',
      simplifiedApplication: false,
      lessThan10Applicants: false
    });
    setSearchTerms({ keywords: '', location: '' });
  };

  const getCurrentJobs = () => {
    return activeTab === 'search' ? jobs : recommendations;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Find Your Dream Job
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Search and discover opportunities that match your skills
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Search Jobs
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Star className="h-4 w-4 inline mr-2" />
            AI Recommendations
          </button>
        </div>
      </div>

      {/* Resume Selection for Recommendations */}
      {activeTab === 'recommendations' && resumes.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Use resume for recommendations:
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Most recent resume</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fileName}
                </option>
              ))}
            </select>
            <Button
              onClick={handleGetRecommendations}
              isLoading={loading}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </Card>
      )}

      {/* Search Bar */}
      {activeTab === 'search' && (
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Job title, keywords..."
                value={searchTerms.keywords}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, keywords: e.target.value }))}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Location"
                value={searchTerms.location}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, location: e.target.value }))}
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:px-4"
              >
                <Filter className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Filters</span>
              </Button>
              <Button onClick={handleSearch} isLoading={loading}>
                Search Jobs
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && activeTab === 'search' && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Any</option>
                <option value="1">Intern</option>
                <option value="2">Entry Level</option>
                <option value="3">Associate</option>
                <option value="4">Mid-Senior Level</option>
                <option value="5">Director</option>
                <option value="6">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Any</option>
                <option value="F">Full-time</option>
                <option value="P">Part-time</option>
                <option value="C">Contract</option>
                <option value="I">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Schedule
              </label>
              <select
                value={filters.workSchedule}
                onChange={(e) => handleFilterChange('workSchedule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Any</option>
                <option value="1">On-site</option>
                <option value="2">Remote</option>
                <option value="3">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Posted Within
              </label>
              <select
                value={filters.postedWithin}
                onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">Any time</option>
                <option value="r86400">Last 24 hours</option>
                <option value="r604800">Last 7 days</option>
                <option value="r2592000">Last 30 days</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="simplifiedApplication"
                checked={filters.simplifiedApplication}
                onChange={(e) => handleFilterChange('simplifiedApplication', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="simplifiedApplication" className="text-sm text-gray-700 dark:text-gray-300">
                Simplified Application
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lessThan10Applicants"
                checked={filters.lessThan10Applicants}
                onChange={(e) => handleFilterChange('lessThan10Applicants', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="lessThan10Applicants" className="text-sm text-gray-700 dark:text-gray-300">
                Less than 10 applicants
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Results Header */}
      {getCurrentJobs().length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {getCurrentJobs().length} {activeTab === 'search' ? 'jobs' : 'recommendations'}
            {activeTab === 'search' && totalResults > 0 && ` of ${totalResults}`}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Date Posted (Newest)</option>
              <option value="oldest">Date Posted (Oldest)</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text={activeTab === 'search' ? "Searching for jobs..." : "Getting recommendations..."} />
        </div>
      )}

      {/* Job Results */}
      {!loading && getCurrentJobs().length > 0 && (
        <div className="space-y-4">
          {getCurrentJobs().map(job => (
            <Card key={job.id} hover className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium">{job.company}</span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.postTime}
                    </span>
                  </div>
                  {job.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  {job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 4).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm">
                    {job.salary && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {job.type} • {job.workSchedule}
                    </span>
                    {job.simplifiedApplication && (
                      <span className="text-blue-600 dark:text-blue-400">
                        Easy Apply
                      </span>
                    )}
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      {job.applicantCount} applicants
                    </span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(job.jobUrl, '_blank')}
                  className="ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && getCurrentJobs().length === 0 && (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No {activeTab === 'search' ? 'jobs' : 'recommendations'} found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {activeTab === 'search' 
              ? 'Try adjusting your search criteria or filters'
              : 'Try uploading a resume or adjusting your search criteria'
            }
          </p>
          {activeTab === 'search' && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};