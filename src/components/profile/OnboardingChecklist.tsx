import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingChecklistProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    major?: string;
    studentId?: string;
    graduationYear?: string;
    dateOfBirth?: string;
    isVerified: boolean;
    verificationStatus: string; // 'pending' | 'in_progress' | 'approved' | 'rejected' | 'requested'
  };
  onNavigateToTab: (tab: string) => void;
  onOpenOnboarding: () => void;
  onDismiss: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'complete' | 'pending' | 'in_progress' | 'action_required' | 'optional';
  action: () => void;
  actionLabel: string;
  hidden?: boolean;
}

// Verification status display config
const verificationStatusConfig = {
  pending: {
    label: 'Not Started',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    description: 'Upload documents to verify your student status'
  },
  in_progress: {
    label: 'Under Review',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Your verification is being reviewed (1-2 business days)'
  },
  approved: {
    label: 'Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Your student status has been verified'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Your verification was rejected. Please resubmit.'
  },
  requested: {
    label: 'Info Requested',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Additional information is needed for verification'
  }
};

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  user,
  onNavigateToTab,
  onOpenOnboarding,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Determine verification status (normalize to lowercase)
  const verificationStatus = (user.verificationStatus || 'pending').toLowerCase();
  const isVerified = user.isVerified || verificationStatus === 'approved';
  const isInReview = verificationStatus === 'in_progress';
  const needsResubmission = verificationStatus === 'rejected' || verificationStatus === 'requested';

  // Calculate profile completeness - required fields
  const hasRequiredPersonalDetails = !!(user.firstName && user.lastName && user.email && user.dateOfBirth);
  // Optional fields don't block completion
  const hasOptionalPersonalDetails = !!(user.phone);
  
  // Student info - at least studentId is useful for verification
  const hasStudentInfo = !!(user.major || user.studentId || user.graduationYear);

  // Build dynamic checklist based on user's actual state
  const checklistItems: ChecklistItem[] = [
    {
      id: 'account',
      title: 'Create your account',
      description: 'Sign up for StudentX',
      icon: CheckCircle2,
      status: 'complete',
      action: () => {},
      actionLabel: 'Done'
    },
    {
      id: 'personal',
      title: 'Complete personal details',
      description: hasRequiredPersonalDetails 
        ? 'Basic information added' 
        : 'Add date of birth to continue',
      icon: User,
      status: hasRequiredPersonalDetails ? 'complete' : 'pending',
      action: () => onNavigateToTab('account'),
      actionLabel: 'Complete'
    },
    {
      id: 'student',
      title: 'Add student information',
      description: hasStudentInfo 
        ? 'Student details added' 
        : 'Major, student ID & graduation year',
      icon: User,
      status: hasStudentInfo ? 'complete' : 'optional',
      action: () => onNavigateToTab('account'),
      actionLabel: 'Add Info'
    },
    {
      id: 'verification',
      title: 'Verify student status',
      description: verificationStatusConfig[verificationStatus]?.description || 'Verify to unlock exclusive deals',
      icon: isInReview ? Clock : needsResubmission ? AlertCircle : ShieldCheck,
      status: isVerified ? 'complete' : isInReview ? 'in_progress' : needsResubmission ? 'action_required' : 'pending',
      action: () => onNavigateToTab('verification?scrollTo=student-verify-button'),
      actionLabel: needsResubmission ? 'Resubmit' : isInReview ? 'View Status' : 'Verify'
    }
  ];

  // Filter out hidden items
  const visibleItems = checklistItems.filter(item => !item.hidden);

  // Count completed items (complete status only)
  const completedCount = visibleItems.filter(item => item.status === 'complete').length;
  // For progress, treat in_progress as partial completion
  const progressCount = visibleItems.filter(item => 
    item.status === 'complete' || item.status === 'in_progress'
  ).length;
  const progress = (progressCount / visibleItems.length) * 100;
  const allComplete = completedCount === visibleItems.length;

  // Determine what the main CTA should do
  const getMainCTAConfig = () => {
    // If verification is in review, no action needed
    if (isInReview) {
      return {
        label: 'Verification In Review',
        description: 'We\'ll notify you once your verification is complete',
        action: () => onNavigateToTab('verification'),
        disabled: false,
        variant: 'primary' as const,
        icon: Clock
      };
    }

    // If verification was rejected or needs more info
    if (needsResubmission) {
      return {
        label: 'Resubmit Verification',
        description: 'Additional action required for your verification',
        action: () => onNavigateToTab('verification?scrollTo=student-verify-button'),
        disabled: false,
        variant: 'destructive' as const,
        icon: AlertCircle
      };
    }

    // If personal details are incomplete
    if (!hasRequiredPersonalDetails) {
      return {
        label: 'Complete Profile',
        description: 'Add your date of birth to continue',
        action: onOpenOnboarding,
        disabled: false,
        variant: 'default' as const,
        icon: ArrowRight
      };
    }

    // If verification not started (pending)
    if (verificationStatus === 'pending') {
      return {
        label: 'Start Verification',
        description: 'Verify your student status to unlock deals',
        action: () => onNavigateToTab('verification?scrollTo=student-verify-button'),
        disabled: false,
        variant: 'default' as const,
        icon: ShieldCheck
      };
    }

    // Default fallback
    return {
      label: 'Continue Setup',
      action: onOpenOnboarding,
      disabled: false,
      variant: 'default' as const,
      icon: ArrowRight
    };
  };

  const mainCTA = getMainCTAConfig();

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('checklist_dismissed', 'true');
    onDismiss();
  };

  const wasSessionDismissed = sessionStorage.getItem('checklist_dismissed') === 'true';

  // Don't show if all complete or dismissed this session
  if (allComplete || isDismissed || wasSessionDismissed) {
    return null;
  }

  const getStatusIcon = (item: ChecklistItem) => {
    switch (item.status) {
      case 'complete':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-amber-500 animate-pulse" />;
      case 'action_required':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'optional':
        return <Circle className="h-6 w-6 text-gray-300" strokeDasharray="4 2" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getItemStyle = (item: ChecklistItem) => {
    switch (item.status) {
      case 'complete':
        return 'bg-green-50/50';
      case 'in_progress':
        return 'bg-amber-50/50 border border-amber-200';
      case 'action_required':
        return 'bg-red-50/50 border border-red-200';
      default:
        return 'bg-white hover:bg-gray-50 cursor-pointer';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-blue-200 bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 mb-6 overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {isInReview ? 'Verification In Progress' : 'Complete Your Profile'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isInReview 
                      ? 'Your documents are being reviewed' 
                      : `${completedCount} of ${visibleItems.length} steps completed`
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 hover:bg-blue-100 -mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pt-3">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Checklist items */}
            <div className="p-4 pt-3">
              <div className="space-y-2">
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getItemStyle(item)}`}
                    onClick={() => item.status !== 'complete' && item.status !== 'in_progress' && item.action()}
                  >
                    <div className="shrink-0">
                      {getStatusIcon(item)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${
                        item.status === 'complete' ? 'text-gray-500 line-through' : 
                        item.status === 'optional' ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {item.title}
                        {item.status === 'optional' && (
                          <span className="ml-2 text-xs text-gray-400 font-normal">(optional)</span>
                        )}
                      </p>
                      <p className={`text-xs ${
                        item.status === 'in_progress' ? 'text-amber-600' :
                        item.status === 'action_required' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>{item.description}</p>
                    </div>

                    {item.status !== 'complete' && item.status !== 'in_progress' && (
                      <Button
                        size="sm"
                        variant={item.status === 'action_required' ? 'destructive' : 'ghost'}
                        className={item.status === 'action_required' 
                          ? 'shrink-0' 
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action();
                        }}
                      >
                        {item.actionLabel}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                    
                    {item.status === 'in_progress' && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full shrink-0">
                        In Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA - context-aware */}
            <div className="px-4 pb-4">
              {mainCTA.description && (
                <p className="text-xs text-gray-500 text-center mb-2">{mainCTA.description}</p>
              )}
              <Button
                onClick={mainCTA.action}
                disabled={mainCTA.disabled}
                variant={mainCTA.variant}
                className={`w-full ${mainCTA.variant === 'default' ? 'bg-brand-primary hover:bg-brand-primary/80 text-white' : ''}`}
              >
                {mainCTA.label}
                <mainCTA.icon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingChecklist;
