import React, { useState } from 'react';
import { Upload, RefreshCw, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { Resume } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface ResumeUploadProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (screen: string) => void;
}

interface ExperienceData {
  company?: string;
  title?: string;
  duration?: string;
  description?: string;
}

interface EducationData {
  institution?: string;
  degree?: string;
  years?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ showToast, onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);
  const [isReparsing, setIsReparsing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid file type (PDF, DOC, DOCX, or TXT)', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiService.uploadResume(file);
      
      if (response.success && response.data) {
        const resume: Resume = {
          id: response.data.resumeId,
          fileName: response.data.fileName,
          uploadedAt: response.data.uploadedAt,
          extractedData: {
            summary: response.data.extractedData.summary || '',
            skills: response.data.extractedData.skills || [],
            experience: response.data.extractedData.experience?.map((exp: ExperienceData) => ({
              company: exp.company || '',
              position: exp.title || '',
              duration: exp.duration || '',
              description: exp.description || ''
            })) || [],
            education: response.data.extractedData.education?.map((edu: EducationData) => ({
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
        
        setUploadedResume(resume);
        showToast('Resume uploaded and processed successfully!', 'success');
      } else {
        showToast('Failed to upload resume. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading. Please try again.';
      
      // Provide specific guidance for API key errors
      if (errorMessage.includes('API key') || errorMessage.includes('Gemini')) {
        showToast('Invalid Gemini API key. Please update your API key in your profile settings.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReparse = async () => {
    if (!uploadedResume) return;
    
    setIsReparsing(true);
    try {
      const response = await apiService.reparseResume(uploadedResume.id);
      
      if (response.success && response.data) {
        const updatedResume: Resume = {
          ...uploadedResume,
          extractedData: {
            summary: response.data.extractedData.summary || '',
            skills: response.data.extractedData.skills || [],
            experience: response.data.extractedData.experience?.map((exp: ExperienceData) => ({
              company: exp.company || '',
              position: exp.title || '',
              duration: exp.duration || '',
              description: exp.description || ''
            })) || [],
            education: response.data.extractedData.education?.map((edu: EducationData) => ({
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
        
        setUploadedResume(updatedResume);
        showToast('Resume re-parsed successfully!', 'success');
      } else {
        showToast('Failed to re-parse resume. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Reparse error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while re-parsing. Please try again.';
      
      // Provide specific guidance for API key errors
      if (errorMessage.includes('API key') || errorMessage.includes('Gemini')) {
        showToast('Invalid Gemini API key. Please update your API key in your profile settings.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsReparsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Your Resume
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Upload your resume and let AI extract key information
        </p>
      </div>

      {!uploadedResume ? (
        <Card className="p-8">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" text="Processing your resume..." />
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your resume here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    or click to browse files
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                  Resume Uploaded Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {uploadedResume.fileName} has been processed and analyzed.
                </p>
              </div>
            </div>
          </Card>

          {/* Extracted Data */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Extracted Information
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReparse}
                  isLoading={isReparsing}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-parse
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('resumes')}
                >
                  View All Resumes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                    <p className="text-gray-900 dark:text-white">{uploadedResume.extractedData.contact.email.split('@')[0] || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="text-gray-900 dark:text-white">{uploadedResume.extractedData.contact.email || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                    <p className="text-gray-900 dark:text-white">{uploadedResume.extractedData.contact.phone || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location:</span>
                    <p className="text-gray-900 dark:text-white">{uploadedResume.extractedData.contact.location || 'Not found'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {uploadedResume.extractedData.skills.length > 0 ? (
                    uploadedResume.extractedData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No skills found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {uploadedResume.extractedData.summary && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {uploadedResume.extractedData.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {uploadedResume.extractedData.experience.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Experience
                </h3>
                <div className="space-y-4">
                  {uploadedResume.extractedData.experience.map((exp, index) => (
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
            {uploadedResume.extractedData.education.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Education
                </h3>
                <div className="space-y-3">
                  {uploadedResume.extractedData.education.map((edu, index) => (
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
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => onNavigate('jobs')}
              className="px-8"
            >
              Search Jobs
            </Button>
            <Button
              variant="secondary"
              onClick={() => setUploadedResume(null)}
            >
              Upload Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 