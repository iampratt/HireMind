import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, Mail, Phone, MapPin, Calendar, Star, Briefcase, GraduationCap } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { Resume } from '../../types';

interface ProfileProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Profile: React.FC<ProfileProps> = ({ showToast }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchProfileData();
    }
  }, [profileId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileResponse = await apiService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
        
        // Format resumes data
        const formattedResumes: Resume[] = (profileResponse.data.resumes || []).map((resume: any) => ({
          id: resume.id,
          fileName: resume.fileName,
          uploadedAt: resume.uploadedAt,
          extractedData: {
            summary: resume.extractedData?.summary || '',
            skills: resume.extractedData?.skills || [],
            experience: resume.extractedData?.experience?.map((exp: any) => ({
              company: exp.company || '',
              position: exp.title || '',
              duration: exp.duration || '',
              description: exp.description || ''
            })) || [],
            education: resume.extractedData?.education?.map((edu: any) => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              year: edu.years || '',
              gpa: ''
            })) || [],
            contact: {
              email: resume.extractedData?.email || '',
              phone: resume.extractedData?.phone || '',
              location: resume.extractedData?.location || ''
            }
          }
        }));
        
        setResumes(formattedResumes);
      } else {
        showToast('Failed to fetch profile data', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      showToast('An error occurred while fetching profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Profile not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The profile you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {profile.name || 'User Profile'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Professional Profile
        </p>
      </div>

      {/* Contact Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{profile.phone}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{profile.location}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {resumes.length}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Resumes Uploaded
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {resumes.length > 0 ? 'Active' : 'Inactive'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Profile Status
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {resumes.length > 0 ? formatDate(resumes[0].uploadedAt) : 'Never'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last Updated
          </p>
        </Card>
      </div>

      {/* Resumes Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resumes
          </h2>
          <Button onClick={() => navigate('/upload')}>
            Upload New Resume
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No resumes uploaded yet.
            </p>
            <Button onClick={() => navigate('/upload')}>
              Upload Resume
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume, index) => (
              <div key={resume.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {resume.fileName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded {formatDate(resume.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/resumes/${resume.id}`)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Quick Resume Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {resume.extractedData.skills.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resume.extractedData.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {resume.extractedData.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                            +{resume.extractedData.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {resume.extractedData.experience.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {resume.extractedData.experience.length} position{resume.extractedData.experience.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {resume.extractedData.education.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Education:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {resume.extractedData.education.length} degree{resume.extractedData.education.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={() => navigate('/jobs')}>
          Search Jobs
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}; 