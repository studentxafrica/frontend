import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  User,
  GraduationCap,
  ShieldCheck,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  X,
  MapPin,
  Phone,
  Calendar,
  School,
  BookOpen,
  CheckCircle2,
  Zap
} from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import axiosInstance from '@/api/axios';
import { toast } from '@/hooks/use-toast';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
    phone?: string;
    dateOfBirth?: string;
    location?: string;
    major?: string;
    studentId?: string;
    graduationYear?: string;
    isVerified?: boolean;
    verificationStatus?: string; // 'pending' | 'in_progress' | 'approved' | 'rejected' | 'requested'
  };
}

interface OnboardingData {
  phone: string;
  dateOfBirth: string;
  location: string;
  major: string;
  studentId: string;
  graduationYear: string;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'student', title: 'Student Info', icon: GraduationCap },
  { id: 'verification', title: 'Verification', icon: ShieldCheck },
  { id: 'complete', title: 'All Done', icon: PartyPopper },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  user
}) => {
  // Determine the initial step based on user's current state
  const getInitialStep = () => {
    const verificationStatus = (user.verificationStatus || 'pending').toLowerCase();
    const isVerified = user.isVerified || verificationStatus === 'approved';
    const isInReview = verificationStatus === 'in_progress';
    
    // If verified, go to complete step
    if (isVerified) return 4; // 'complete' step
    
    // If in review, close wizard - nothing to do
    if (isInReview) return -1; // Signal to not show wizard
    
    // Check if personal details are complete (dateOfBirth is required)
    const hasRequiredPersonalDetails = !!(user.dateOfBirth);
    if (!hasRequiredPersonalDetails) return 1; // 'personal' step
    
    // Check if student info is added (at least one field)
    const hasStudentInfo = !!(user.major || user.studentId || user.graduationYear);
    if (!hasStudentInfo) return 2; // 'student' step
    
    // If we have all info but not verified, go to verification step
    return 3; // 'verification' step
  };

  const initialStep = getInitialStep();
  const [currentStep, setCurrentStep] = useState(initialStep === -1 ? 0 : initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    location: user.location || '',
    major: user.major || '',
    studentId: user.studentId || '',
    graduationYear: user.graduationYear || ''
  });

  // If verification is in review, auto-close the wizard
  React.useEffect(() => {
    if (initialStep === -1 && isOpen) {
      toast({
        title: 'Verification In Progress',
        description: 'Your verification is currently being reviewed. We\'ll notify you once it\'s complete.',
        variant: 'default'
      });
      onClose();
    }
  }, [initialStep, isOpen, onClose]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed (skipped)
    localStorage.setItem('onboarding_completed', 'skipped');
    onClose();
  };

  const handleSaveAndContinue = async () => {
    // Only save if there's actual data to save
    const hasPersonalData = formData.phone || formData.dateOfBirth || formData.location;
    const hasStudentData = formData.major || formData.studentId || formData.graduationYear;
    
    // Save current data before moving to next step (only if there's data)
    if ((currentStep === 1 && hasPersonalData) || (currentStep === 2 && hasStudentData)) {
      try {
        setIsSubmitting(true);
        
        // Build payload with only non-empty values
        const payload: Record<string, string> = {};
        if (formData.phone) payload.phone = formData.phone;
        if (formData.dateOfBirth) payload.date_of_birth = formData.dateOfBirth;
        if (formData.location) payload.location = formData.location;
        if (formData.major) payload.major = formData.major;
        if (formData.studentId) payload.student_id = formData.studentId;
        if (formData.graduationYear) payload.graduation_year = formData.graduationYear;
        
        await axiosInstance.put('/user/me', payload);
        
        toast({
          title: 'Progress Saved',
          description: 'Your information has been saved.',
          variant: 'default'
        });
      } catch (error: any) {
        toast({
          title: 'Could not save',
          description: error.response?.data?.message || 'Failed to save your information. You can try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
    handleNext();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleStartVerification = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
    // Navigate to verification tab after closing
    window.location.href = '/me?tab=verification&scrollTo=student-verify-button';
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep userName={user.firstName} onNext={handleNext} />;
      case 'personal':
        return (
          <PersonalDetailsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      case 'student':
        return (
          <StudentInfoStep
            formData={formData}
            setFormData={setFormData}
            university={user.university || ''}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      case 'verification':
        return (
          <VerificationIntroStep
            onStartVerification={handleStartVerification}
            onSkip={handleComplete}
            onBack={handleBack}
          />
        );
      case 'complete':
        return <CompleteStep userName={user.firstName} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white" hideCloseButton>
        {/* Header with progress */}
        <div className="relative bg-slate-800 text-white p-6 pb-8">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-primary" />
                <span className="font-semibold">StudentX</span>
              </div>
              {currentStep > 0 && currentStep < STEPS.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white hover:bg-white/10 -mr-2"
                >
                  Skip for now
                  <X className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      index < currentStep
                        ? 'bg-white text-brand-primary'
                        : index === currentStep
                        ? 'bg-white/20 text-white ring-2 ring-white'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-white/70">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Step Components

const WelcomeStep: React.FC<{ userName: string; onNext: () => void }> = ({ userName, onNext }) => (
  <div className="text-center py-4">
    <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Sparkles className="h-10 w-10 text-brand-primary" />
    </div>
    
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      Welcome to StudentX, {userName}!
    </h2>
    
    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
      You're just a few steps away from unlocking exclusive student discounts and deals tailored just for you.
    </p>

    <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Personalized Deals</p>
          <p className="text-sm text-gray-500">Get offers matched to your interests</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Verified Student Status</p>
          <p className="text-sm text-gray-500">Access exclusive student-only discounts</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Save More</p>
          <p className="text-sm text-gray-500">Track your savings and favorite deals</p>
        </div>
      </div>
    </div>

    <Button
      onClick={onNext}
      className="w-full bg-brand-primary hover:bg-brand-primary/80"
    >
      Let's Get Started
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  </div>
);

const PersonalDetailsStep: React.FC<{
  formData: OnboardingData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}> = ({ formData, setFormData, onNext, onBack, isSubmitting }) => (
  <div className="py-2">
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
      <p className="text-gray-500 text-sm">Help us personalize your experience (optional)</p>
    </div>

    <div className="space-y-4">
      <div>
        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <Phone className="h-4 w-4 text-gray-400" />
          Phone Number
        </Label>
        <PhoneInput
          value={formData.phone}
          onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
          defaultCountry="KE"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          Date of Birth
        </Label>
        <Input
          id="dob"
          type="date"
          value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <MapPin className="h-4 w-4 text-gray-400" />
          Location
        </Label>
        <Input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="City, Country"
          className="w-full"
        />
      </div>
    </div>

    <div className="flex gap-3 mt-8">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={isSubmitting}
        className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
      >
        {isSubmitting ? 'Saving...' : 'Continue'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

const StudentInfoStep: React.FC<{
  formData: OnboardingData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  university: string;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}> = ({ formData, setFormData, university, onNext, onBack, isSubmitting }) => (
  <div className="py-2">
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">Student Information</h2>
      <p className="text-gray-500 text-sm">Tell us about your academic journey</p>
    </div>

    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
        <School className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-xs text-blue-600 font-medium">Your University</p>
          <p className="text-sm text-gray-900">{university || 'Not specified'}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="major" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <BookOpen className="h-4 w-4 text-gray-400" />
          Major / Field of Study
        </Label>
        <Input
          id="major"
          type="text"
          value={formData.major}
          onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
          placeholder="e.g., Computer Science"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="studentId" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <User className="h-4 w-4 text-gray-400" />
          Student ID
        </Label>
        <Input
          id="studentId"
          type="text"
          value={formData.studentId}
          onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
          placeholder="Your student ID number"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="graduationYear" className="text-sm font-medium flex items-center gap-2 mb-1.5">
          <GraduationCap className="h-4 w-4 text-gray-400" />
          Expected Graduation
        </Label>
        <Input
          id="graduationYear"
          type="month"
          value={formData.graduationYear}
          onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
          min={`${new Date().getFullYear()}-01`}
          max={`${new Date().getFullYear() + 8}-12`}
          className="w-full"
        />
      </div>
    </div>

    <div className="flex gap-3 mt-8">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={isSubmitting}
        className="flex-1 bg-brand-primary hover:bg-brand-primary/80"
      >
        {isSubmitting ? 'Saving...' : 'Continue'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

const VerificationIntroStep: React.FC<{
  onStartVerification: () => void;
  onSkip: () => void;
  onBack: () => void;
}> = ({ onStartVerification, onSkip, onBack }) => (
  <div className="py-2">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-linear-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Verify Your Student Status</h2>
      <p className="text-gray-500 text-sm mt-1">Unlock exclusive student-only deals</p>
    </div>

    <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Why verify?</h3>
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-gray-600">Access to premium student discounts up to 50% off</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-gray-600">Exclusive deals from top brands</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-gray-600">Priority access to limited-time offers</span>
        </li>
      </ul>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 mb-6">
      <p className="text-xs text-gray-500 text-center">
        Verification is quick and secure. Your documents are protected and never shared.
      </p>
    </div>

    <div className="space-y-3">
      <Button
        onClick={onStartVerification}
        className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        <ShieldCheck className="h-4 w-4 mr-2" />
        Verify Now
      </Button>
      
      <Button
        variant="outline"
        onClick={onSkip}
        className="w-full"
      >
        I'll do this later
      </Button>

      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full text-gray-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>
  </div>
);

const CompleteStep: React.FC<{ userName: string; onComplete: () => void }> = ({ userName, onComplete }) => (
  <div className="text-center py-4">
    <div className="w-20 h-20 bg-linear-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <PartyPopper className="h-10 w-10 text-orange-500" />
    </div>
    
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      You're All Set, {userName}!
    </h2>
    
    <p className="text-gray-600 mb-6">
      Your profile is ready. Start exploring exclusive student deals and save on your favorite brands.
    </p>

    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Pro tip:</span> Complete your student verification to unlock even more exclusive deals!
      </p>
    </div>

    <Button
      onClick={onComplete}
      className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    >
      Start Exploring Deals
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  </div>
);

export default OnboardingWizard;
