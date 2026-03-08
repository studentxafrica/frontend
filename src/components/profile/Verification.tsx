import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  CheckCircle,
  AlertCircle,
  XCircle,
  School,
  Shield,
  Clock,
  Award,
  GraduationCap,
  ExternalLink,
  RefreshCw,
  Info
} from "lucide-react";
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import StudentVerificationModal from '../verification/ManualVerificationModal';

interface VerificationTasksProps {
  onChangeTab?: (tab: string) => void;
  user: {
    isVerified: boolean;
    verificationLevel: number;
    email: string;
    phone: string;
    university: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    verificationStatus: 'pending' | 'in_progress' | 'requested' | 'completed' | 'failed' | 'rejected';
  };
}

declare global {
  interface Window {
    SheerID?: any;
    _sheerid?: any;
  }
}

export const VerificationTasks: React.FC<VerificationTasksProps> = ({ user, onChangeTab }) => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_progress' | 'requested' | 'completed' | 'failed' | 'rejected'>(
    user.verificationStatus
  );
  const scrollToParams = new URLSearchParams(window.location.search).get('scrollTo');

  const [sheerIdLoaded, setSheerIdLoaded] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sheerIdForm, setSheerIdForm] = useState<any>(null);
  const [openModalManualVerification, setOpenModalManualVerification] = useState(false);

  useEffect(() => {
    if (scrollToParams) {
      const element = document.getElementById(scrollToParams);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollToParams]);

  // Load SheerID script dynamically
  // Fixed initializeSheerID function
  const initializeSheerID = () => {
    // Check if SheerID is available - it should be the default export
    if (!window.SheerID && !window._sheerid) {
      setVerificationStatus('failed');
      setVerificationError('Verification service unavailable. Please try again later.');
      return;
    }

    try {
      // Use the correct SheerID API - it's likely a default export with loadInModal method
      const SheerIDLib = window.SheerID || window._sheerid;

      // For modal implementation, use loadInModal instead of loadInlineIframe
      const form = SheerIDLib.loadInModal(
        `${import.meta.env.VITE_SHEERID_PROGRAM_URL}`, // Your SheerID program URL
        {
          mobileRedirect: false, // Keep modal on mobile
          closeButtonText: 'Close', // Optional close button text
          mobileThreshold: 768, // Mobile breakpoint
          stopPropagation: true
        }
      );

      // Set initial view model with user data
      form.setViewModel({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phone,
        dateOfBirth: user.dateOfBirth || '',
        metadata: {
          userId: "user.id"
        }
      });

      // Set up event hooks
      form.on('ON_VERIFICATION_SUCCESS', (verificationResponse) => {

        setVerificationStatus('completed');
        // Here you would typically send the verification result to your backend
      });

      form.on('ON_VERIFICATION_READY', () => {

      });

      form.on('ON_VERIFICATION_STEP_CHANGE', (verificationResponse) => {

      });

      form.on('ON_FORM_LOCALE_CHANGE', (locale) => {

      });

      form.on('ON_VERIFICATION_ERROR', (error) => {

        setVerificationStatus('failed');
        setVerificationError(error.message || 'Verification failed. Please check your information and try again.');
      });

      setSheerIdForm(form);

    } catch (error) {
      setVerificationStatus('failed');
      setVerificationError('Failed to initialize verification service.');
    }
  };

  // Also update the script loading useEffect
  useEffect(() => {
    if (verificationStatus === 'in_progress' && sheerIdLoaded) {
      // First check if already loaded
      if (window.SheerID || window._sheerid) {
        setSheerIdLoaded(true);
        initializeSheerID();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@sheerid/jslib@2/sheerid-install.js';
      script.id = 'sheerid-js';
      script.type = 'module'; // Important: keep as module
      script.async = true;

      // Load CSS as well
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@sheerid/jslib@2/sheerid-install.css';
      link.type = 'text/css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      script.onload = () => {
        // Add a small delay to ensure the module is fully loaded
        setTimeout(() => {
          setSheerIdLoaded(true);
          initializeSheerID();
        }, 100);
      };

      script.onerror = () => {
        setVerificationStatus('failed');
        setVerificationError('Failed to load verification service. Please try again later.');
      };

      document.head.appendChild(script); // Append to head instead of body for modules

      return () => {
        const existingScript = document.getElementById('sheerid-js');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
    }
  }, [verificationStatus, sheerIdLoaded]);

  const handleStudentVerification = () => {
    setVerificationError(null);
    setRetryCount(prev => prev + 1);
    if (!window.SheerID && !window._sheerid) {
      // setVerificationStatus('in_progress');
      setOpenModalManualVerification(true);
    } else {
      initializeSheerID();
    }
  };

  const handleVerificationSubmit = (data: any) => {
    // Handle the form submission logic here
    setOpenModalManualVerification(false);
    setVerificationStatus('in_progress');
    // You can also call initializeSheerID() here if needed
  };

  const handleVerificationResubmit = (data: any) => {
    // Handle the form resubmission logic here
    setOpenModalManualVerification(false);
    setVerificationStatus('in_progress');
    // You can also call initializeSheerID() here if needed
  };

  // Rest of your component remains the same...
  const verificationSteps = [
    {
      id: 'profile_completion',
      title: 'Complete Profile',
      description: 'Add student information on your profile to continue with verification',
      icon: School,
      status: user.verificationLevel >= 87 ? 'completed' : 'pending',
      required: false
    },
    {
      id: 'student_verification',
      title: 'Student Status Verification',
      description:
        verificationStatus === 'pending'
          ? 'Complete identity verification. To verify your student status.'
          : verificationStatus === 'in_progress' ? 'Identity verification is in progress'
          : verificationStatus === 'requested' ? 'More information has been requested by our team'
            : verificationStatus === 'failed' ? 'Identity verification failed'
            : verificationStatus === 'completed' ? 'Your student status has been verified'
              : 'Your verification request was rejected.',
      icon: GraduationCap,
      status: verificationStatus == 'completed' ? 'verified' : verificationStatus,
      required: true
    },
  ];

  const getStampConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'COMPLETE',
          color: 'text-emerald-600',
          borderColor: 'border-emerald-600',
          bgColor: 'bg-emerald-50',
          rotation: '-rotate-12',
          icon: <CheckCircle className="h-5 w-5" />,
        };
      case 'verified':
        return {
          label: 'VERIFIED',
          color: 'text-emerald-600',
          borderColor: 'border-emerald-600',
          bgColor: 'bg-emerald-50',
          rotation: '-rotate-12',
          icon: <CheckCircle className="h-5 w-5" />,
        };
      case 'in_progress':
        return {
          label: 'IN REVIEW',
          color: 'text-amber-600',
          borderColor: 'border-amber-600',
          bgColor: 'bg-amber-50',
          rotation: '-rotate-6',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        };
      case 'pending':
        return {
          label: 'PENDING',
          color: 'text-amber-500',
          borderColor: 'border-amber-500',
          bgColor: 'bg-amber-50',
          rotation: '-rotate-12',
          icon: <Clock className="h-4 w-4" />,
        };
      case 'failed':
        return {
          label: 'FAILED',
          color: 'text-red-600',
          borderColor: 'border-red-600',
          bgColor: 'bg-red-50',
          rotation: 'rotate-6',
          icon: <XCircle className="h-4 w-4" />,
        };
      case 'rejected':
        return {
          label: 'REJECTED',
          color: 'text-red-600',
          borderColor: 'border-red-600',
          bgColor: 'bg-red-50',
          rotation: '-rotate-12',
          icon: <XCircle className="h-4 w-4" />,
        };
      case 'requested':
        return {
          label: 'ACTION REQ.',
          color: 'text-blue-600',
          borderColor: 'border-blue-600',
          bgColor: 'bg-blue-50',
          rotation: '-rotate-6',
          icon: <Info className="h-4 w-4" />,
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'text-gray-500',
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-50',
          rotation: '-rotate-12',
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };

  const StatusStamp = ({ status }: { status: string }) => {
    const config = getStampConfig(status);
    return (
      <div className={`absolute top-1/2 right-4 -translate-y-1/2 ${config.rotation} pointer-events-none z-10`}>
        <div
          className={`
            w-20 h-20 rounded-full
            flex flex-col items-center justify-center
            ${config.bgColor} ${config.color} ${config.borderColor}
            border-[3px] border-double
            opacity-80
          `}
          style={{
            boxShadow: `inset 0 0 0 3px currentColor`,
            maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")',
            maskSize: '150px',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <div className="mb-0.5">{config.icon}</div>
          <span className="text-[9px] font-extrabold tracking-wider uppercase leading-tight text-center px-1">
            {config.label}
          </span>
        </div>
      </div>
    );
  };

  const completedSteps = verificationSteps.filter(step => step.status === 'completed' || step.status === 'verified').length;

  return (
    <div className="space-y-6">
      {/* Manual Verification Modal */}
      <Dialog open={openModalManualVerification} onOpenChange={setOpenModalManualVerification}>
        <StudentVerificationModal
          student={user}
          isOpen={openModalManualVerification}
          onClose={() => setOpenModalManualVerification(false)}
          currentStatus={{
            status: verificationStatus as 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'info_requested',
          }}
          onSubmit={handleVerificationSubmit}
          onResubmit={handleVerificationResubmit}
        />
      </Dialog>

      {/* Progress Overview */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-brand-primary" />
                Student Identity Verification
              </CardTitle>
              <CardDescription className='text-xs text-neutral-medium'>
                Verify your student status to access exclusive deals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-center items-center gap-2">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-neutral-medium">
                  {completedSteps}/{verificationSteps.length} completed
                </span>
              </div>
            </div>
            {completedSteps === verificationSteps.length ? (
              <div className="text-success text-sm font-medium">
                <div className='flex items-center gap-2'>
                  <CheckCircle className="inline h-4 w-4" />
                  <h1 className='text-lg'>You're all set</h1>
                </div>
                <p className="text-neutral-400">You've completed all verification steps. You can now browse all exclusive deals on StudentX</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-lighter">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">{user.verificationLevel}%</div>
                  <div className="text-sm text-neutral-medium">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-accent">{completedSteps}</div>
                  <div className="text-sm text-neutral-medium">Steps Done</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <div className="grid grid-cols-1 gap-4">
        {verificationSteps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Card key={step.id} className="border-neutral-lighter relative overflow-hidden">
              {/* Stamp overlay */}
              <StatusStamp status={step.status} />

              <CardContent className="p-5 sm:p-6">
                {/* Row 1: Icon | Title+Description */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Step Icon */}
                  <div className="shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <StepIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                    </div>
                  </div>

                  {/* Title + Description (stacked on lg, title-only on small) */}
                  <div className="flex-1 min-w-0 mr-20 sm:mr-24">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">{step.title}</h3>
                      {step.required && (
                        <span className="hidden sm:inline text-[10px] font-medium text-neutral-medium border border-neutral-200 rounded px-1.5 py-0.5 shrink-0">Required</span>
                      )}
                    </div>
                    {/* Description visible on md+ in same row */}
                    <p className="hidden md:block text-neutral-medium text-sm mt-0.5 truncate">{step.description}</p>
                  </div>
                </div>

                {/* Row 2 (small screens only): Description */}
                <p className="md:hidden text-neutral-medium text-sm mt-2 ml-13 sm:ml-16">{step.description}</p>

                {/* Row 3: Status action messages */}
                <div className="mt-4 ml-13 sm:ml-16">
                    {step.id === 'profile_completion' && step.status === 'pending' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Complete Your Profile</h4>
                            <p className="text-sm text-blue-700 mb-3">
                              Add required data on your profile to continue with your verification.
                            </p>
                            <Button
                              onClick={() => onChangeTab?.('account')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Complete Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.id === 'student_verification' && step.status === 'pending' && (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 mb-1 text-base">Secure Student Verification</h4>
                              <p className="text-sm text-blue-700 mb-3">
                                Securely confirm your student status through our verification system. Your personal information is protected and never stored by us.
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                  onClick={handleStudentVerification}
                                  id="student-verify-button"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Start Verification
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          By verifying, you agree to our Terms of Service and Privacy Policy.
                        </div>
                      </div>
                    )}

                    {step.id === 'student_verification' && step.status === 'in_progress' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Verification in Progress</h4>
                            <p className="text-sm text-yellow-700">
                              Your verification is being processed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(step.status === 'completed' || step.status === 'verified') && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        {step.id === 'student_verification' ? (
                          <span>Student status verified</span>
                        ) : (
                          <span>Profile completed</span>
                        )}
                      </div>
                    )}

                    {step.id === 'student_verification' && step.status === 'requested' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">More Information Requested</h4>
                            <p className="text-sm text-blue-700 mb-3">
                              Our team has requested additional information to complete your verification. Please check your email for details.
                            </p>
                            <Button
                              onClick={() => setOpenModalManualVerification(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Provide Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(step.status === 'failed' || step.status === 'rejected') && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-900 mb-1 text-lg">
                              {step.status === 'rejected' ? 'Verification Rejected' : 'Verification Failed'}
                            </h4>
                            <p className="text-xs text-red-700 mb-3">
                              {step.status === 'rejected'
                                ? 'Your verification request was rejected. Please check your email for more details.'
                                : verificationError || 'We couldn\'t verify your student status. Please try again or contact support for assistance.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                onClick={handleStudentVerification}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                disabled={retryCount >= 3}
                              >
                                {retryCount >= 3 ? 'Max attempts reached' : 'Try Again'}
                              </Button>
                              <Link to="mailto:support@studentx.co.ke?subject=Verification Assistance">
                                <Button variant="outline" className="border-neutral-300">
                                  Contact Support
                                </Button>
                              </Link>
                            </div>
                            {retryCount >= 3 && (
                              <p className="text-xs text-red-600 mt-2">
                                You've reached the maximum number of attempts. Please contact support for assistance.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Card */}
      <Card className="border-brand-primary/20 bg-linear-to-r from-brand-primary/5 to-brand-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-brand-primary" />
            Student Verification Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary text-base">Unlock Exclusive Access</h4>
              <ul className="text-sm text-neutral-medium space-y-1">
                <li>• Access to verified student deals</li>
                <li>• Higher discount percentages</li>
                <li>• Priority access to limited offers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary text-base">Trusted & Secure</h4>
              <ul className="text-sm text-neutral-medium space-y-1">
                <li>• Verified by our trusted team</li>
                <li>• Your data stays secure</li>
                <li>• Instant verification process</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};