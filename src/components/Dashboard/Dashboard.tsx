import React, { useState, useEffect } from 'react';
import { Upload, Search, FileText, TrendingUp, Clock, Star } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

interface DashboardStats {
  resumeCount: number;
  jobSearchCount: number;
  matchScore: number;
  lastActivity: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    resumeCount: 0,
    jobSearchCount: 0,
    matchScore: 0,
    lastActivity: 'Never'
  });
  const [loading, setLoading] = useState(true);
  const [recentResumes, setRecentResumes] = useState<Array<{ fileName: string; uploadedAt: string }>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user profile with resumes
      const profileResponse = await apiService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const resumeCount = profileResponse.data.resumes?.length || 0;
        setRecentResumes(profileResponse.data.resumes?.slice(0, 3) || []);
        
        // Calculate match score based on resume completeness
        let matchScore = 0;
        if (resumeCount > 0) {
          const latestResume = profileResponse.data.resumes[0];
          if (latestResume.extractedData) {
            const data = latestResume.extractedData;
            const checks = [
              data.name, data.email, data.phone, data.location,
              data.skills?.length > 0, data.experience?.length > 0,
              data.education?.length > 0, data.summary
            ];
            matchScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);
          }
        }

        setStats({
          resumeCount,
          jobSearchCount: 0, // This would need to be tracked in the backend
          matchScore,
          lastActivity: resumeCount > 0 ? 'Recently' : 'Never'
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload New Resume',
      description: 'Upload and analyze your resume with AI',
      icon: Upload,
      action: () => onNavigate('upload'),
      color: 'blue'
    },
    {
      title: 'Search Jobs',
      description: 'Find jobs that match your profile',
      icon: Search,
      action: () => onNavigate('jobs'),
      color: 'green'
    },
    {
      title: 'AI Recommendations',
      description: 'Get personalized job recommendations',
      icon: Star,
      action: () => onNavigate('jobs'),
      color: 'purple'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your AI-powered job search assistant
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.resumeCount}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Resumes Uploaded
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.jobSearchCount}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jobs Searched
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.matchScore}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Profile Completeness
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.lastActivity}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last Activity
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} onClick={action.action}>
                <Card hover className="p-6 cursor-pointer">
                  <div className={`w-12 h-12 mb-4 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  <Button variant="ghost" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentResumes.length > 0 ? (
            recentResumes.map((resume, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Uploaded resume "{resume.fileName}"
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(resume.uploadedAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No recent activity. Upload your first resume to get started!
              </p>
              <Button 
                onClick={() => onNavigate('upload')}
                className="mt-4"
              >
                Upload Resume
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Profile Completeness */}
      {stats.resumeCount > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Profile Completeness
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Overall Profile</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.matchScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.matchScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.matchScore < 100 
                ? 'Complete your profile to get better job matches'
                : 'Great! Your profile is complete'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};