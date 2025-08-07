import React, { useState, useEffect } from 'react';
import { FileText, Trash2, RefreshCw, Eye, Calendar, User } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { Resume } from '../../types';

interface ResumeListProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (screen: string) => void;
}

export const ResumeList: React.FC<ResumeListProps> = ({ showToast, onNavigate }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reparsingId, setReparsingId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await apiService.getResumes();
      
      if (response.success && response.data) {
        const formattedResumes: Resume[] = response.data.map((resume: any) => ({
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
        showToast('Failed to fetch resumes', 'error');
      }
    } catch (error) {
      console.error('Fetch resumes error:', error);
      showToast('An error occurred while fetching resumes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    setDeletingId(resumeId);
    try {
      const response = await apiService.deleteResume(resumeId);
      
      if (response.success) {
        setResumes(prev => prev.filter(resume => resume.id !== resumeId));
        showToast('Resume deleted successfully', 'success');
      } else {
        showToast('Failed to delete resume', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('An error occurred while deleting the resume', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReparse = async (resumeId: string) => {
    setReparsingId(resumeId);
    try {
      const response = await apiService.reparseResume(resumeId);
      
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
        
        setResumes(prev => prev.map(resume => 
          resume.id === resumeId ? updatedResume : resume
        ));
        showToast('Resume re-parsed successfully', 'success');
      } else {
        showToast('Failed to re-parse resume', 'error');
      }
    } catch (error) {
      console.error('Reparse error:', error);
      showToast('An error occurred while re-parsing the resume', 'error');
    } finally {
      setReparsingId(null);
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
        <LoadingSpinner size="lg" text="Loading resumes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Resumes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage and view your uploaded resumes
          </p>
        </div>
        <Button onClick={() => onNavigate('upload')}>
          Upload New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No resumes uploaded yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your first resume to get started with job matching
          </p>
          <Button onClick={() => onNavigate('upload')}>
            Upload Resume
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumes.map(resume => (
            <Card key={resume.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {resume.fileName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Uploaded {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedResume(resume)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReparse(resume.id)}
                    isLoading={reparsingId === resume.id}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    isLoading={deletingId === resume.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                {resume.extractedData.contact.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 mr-2" />
                    {resume.extractedData.contact.email}
                  </div>
                )}
                
                {resume.extractedData.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills ({resume.extractedData.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {resume.extractedData.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
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
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Experience: {resume.extractedData.experience.length} position{resume.extractedData.experience.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('jobs')}
                  className="flex-1"
                >
                  Search Jobs
                </Button>
                <Button
                  size="sm"
                  onClick={() => onNavigate('jobs')}
                  className="flex-1"
                >
                  Get Recommendations
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resume Detail Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Resume Details
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedResume(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResume.extractedData.contact.email || 'Not found'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResume.extractedData.contact.phone || 'Not found'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResume.extractedData.contact.location || 'Not found'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedResume.extractedData.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.extractedData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedResume.extractedData.summary && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedResume.extractedData.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {selectedResume.extractedData.experience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Experience
                    </h3>
                    <div className="space-y-4">
                      {selectedResume.extractedData.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {exp.position} at {exp.company}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {exp.duration}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedResume.extractedData.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Education
                    </h3>
                    <div className="space-y-3">
                      {selectedResume.extractedData.education.map((edu, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {edu.degree}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution} • {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 