import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, ArrowLeft, Download, Edit } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { Resume } from '../../types';

interface ResumeDetailProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ResumeDetail: React.FC<ResumeDetailProps> = ({ showToast }) => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [reparsing, setReparsing] = useState(false);

  useEffect(() => {
    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId]);

  const fetchResumeData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getResumes();
      
      if (response.success && response.data) {
        const foundResume = response.data.find((r: any) => r.id === resumeId);
        
        if (foundResume) {
          const formattedResume: Resume = {
            id: foundResume.id,
            fileName: foundResume.fileName,
            uploadedAt: foundResume.uploadedAt,
            extractedData: {
              summary: foundResume.extractedData?.summary || '',
              skills: foundResume.extractedData?.skills || [],
              experience: foundResume.extractedData?.experience?.map((exp: any) => ({
                company: exp.company || '',
                position: exp.title || '',
                duration: exp.duration || '',
                description: exp.description || ''
              })) || [],
              education: foundResume.extractedData?.education?.map((edu: any) => ({
                institution: edu.institution || '',
                degree: edu.degree || '',
                year: edu.years || '',
                gpa: ''
              })) || [],
              contact: {
                email: foundResume.extractedData?.email || '',
                phone: foundResume.extractedData?.phone || '',
                location: foundResume.extractedData?.location || ''
              }
            }
          };
          
          setResume(formattedResume);
        } else {
          showToast('Resume not found', 'error');
        }
      } else {
        showToast('Failed to fetch resume data', 'error');
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
      showToast('An error occurred while fetching resume data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReparse = async () => {
    if (!resume) return;
    
    setReparsing(true);
    try {
      const response = await apiService.reparseResume(resume.id);
      
      if (response.success && response.data) {
        const updatedResume: Resume = {
          id: response.data.resumeId,
          fileName: response.data.fileName,
          uploadedAt: response.data.uploadedAt,
          extractedData: {
            summary: response.data.extractedData.summary || '',
            skills: response.data.extractedData.skills || [],
            experience: response.data.extractedData.experience?.map((exp: any) => ({
              company: exp.company || '',
              position: exp.title || '',
              duration: exp.duration || '',
              description: exp.description || ''
            })) || [],
            education: response.data.extractedData.education?.map((edu: any) => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              year: edu.years || '',
              gpa: ''
            })) || [],
            contact: {
              email: response.data.extractedData.email || '',
              phone: response.data.extractedData.phone || '',
              location: response.data.extractedData.location || ''
            }
          }
        };
        
        setResume(updatedResume);
        showToast('Resume re-parsed successfully', 'success');
      } else {
        showToast('Failed to re-parse resume', 'error');
      }
    } catch (error) {
      console.error('Reparse error:', error);
      showToast('An error occurred while re-parsing the resume', 'error');
    } finally {
      setReparsing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading resume..." />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Resume not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The resume you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/resumes')}>
          Back to Resumes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/resumes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {resume.fileName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReparse}
            isLoading={reparsing}
          >
            <Edit className="h-4 w-4 mr-2" />
            Re-parse
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/jobs')}
          >
            Search Jobs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.extractedData.contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{resume.extractedData.contact.email}</span>
                </div>
              )}
              {resume.extractedData.contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{resume.extractedData.contact.phone}</span>
                </div>
              )}
              {resume.extractedData.contact.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{resume.extractedData.contact.location}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Summary */}
          {resume.extractedData.summary && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Professional Summary
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {resume.extractedData.summary}
              </p>
            </Card>
          )}

          {/* Skills */}
          {resume.extractedData.skills.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.extractedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Experience */}
          {resume.extractedData.experience.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Work Experience
              </h2>
              <div className="space-y-6">
                {resume.extractedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {resume.extractedData.education.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Education
              </h2>
              <div className="space-y-4">
                {resume.extractedData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {edu.degree}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resume Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Skills</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {resume.extractedData.skills.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Experience</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {resume.extractedData.experience.length} position{resume.extractedData.experience.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Education</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {resume.extractedData.education.length} degree{resume.extractedData.education.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/jobs')}
                className="w-full"
              >
                Search Jobs
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/upload')}
                className="w-full"
              >
                Upload New Resume
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/resumes')}
                className="w-full"
              >
                View All Resumes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 