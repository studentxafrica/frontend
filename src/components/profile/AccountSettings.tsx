import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  School,
  Calendar,
  MapPin,
  Shield,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Edit3,
  Save,
  AlertTriangle,
  X,
  Loader2,
  BookOpen,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axiosInstance from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface AccountSettingsProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    university?: string;
    graduationYear?: string;
    major?: string;
    studentId?: string;
    bio?: string;
    location?: string;
    avatar?: string;
    dateOfBirth?: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  graduationYear: string;
  major: string;
  studentId: string;
  bio: string;
  location: string;
  dateOfBirth: string;
}

// Helper component for form fields - defined outside to prevent re-renders
const FormFieldWrapper: React.FC<{
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium flex items-center gap-2">
      {icon}
      {label}
    </Label>
    {children}
    {error && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

const DisplayValue: React.FC<{ value?: string; placeholder?: string }> = ({
  value,
  placeholder = 'Not specified'
}) => (
  <p className={`text-sm py-2 ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
    {value || placeholder}
  </p>
);

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Password change state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // React Hook Form setup - much more performant than controlled inputs
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
    getValues
  } = useForm<FormData>({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      university: user.university || '',
      graduationYear: user.graduationYear || '',
      major: user.major || '',
      studentId: user.studentId || '',
      bio: user.bio || '',
      location: user.location || '',
      dateOfBirth: user.dateOfBirth || ''
    },
    mode: 'onBlur' // Only validate on blur, not on every keystroke
  });

  // Reset form when user prop changes
  useEffect(() => {
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      university: user.university || '',
      graduationYear: user.graduationYear || '',
      major: user.major || '',
      studentId: user.studentId || '',
      bio: user.bio || '',
      location: user.location || '',
      dateOfBirth: user.dateOfBirth || ''
    });
  }, [user, reset]);

  // Browser close/refresh protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && isEditing) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isEditing]);

  // Handle entering edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel with confirmation if there are changes
  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  // Confirm cancel - discard changes
  const handleConfirmCancel = () => {
    reset();
    setIsEditing(false);
    setShowCancelDialog(false);
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const response = await axiosInstance.put('/user/me', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        university: data.university || undefined,
        graduation_year: data.graduationYear || undefined,
        major: data.major || undefined,
        student_id: data.studentId || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        date_of_birth: data.dateOfBirth || undefined,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Error updating profile');
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
        variant: 'default'
      });

      // Reset form with new values to clear dirty state
      reset(data);
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || error.message || 'Update Failed',
        description: error.response?.data?.description || 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'New password and confirmation must match.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setChangingPassword(true);
      await axiosInstance.put('/user/me/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
        variant: 'default'
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Password Change Failed',
        description: error.response?.data?.description || 'Please check your current password and try again.',
        variant: 'destructive'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Get current values for display mode
  const currentValues = getValues();

  return (
    <div className="space-y-6">
      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to cancel? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Information Card */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Make changes to your profile information below'
                  : 'Your personal and student information'
                }
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEditClick}
                className="hover:border-brand-primary hover:text-brand-primary"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                <span className='hidden md:inline'>Edit Profile</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-neutral-lighter">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl font-bold bg-brand-primary/10 text-brand-primary">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-neutral-medium">{user.email}</p>
            </div>
          </div>

          <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-brand-primary" />
                Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWrapper label="First Name" error={errors.firstName?.message}>
                  {isEditing ? (
                    <Input
                      {...register('firstName', { required: 'First name is required' })}
                      className={errors.firstName ? 'border-destructive' : ''}
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.firstName} />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper label="Last Name" error={errors.lastName?.message}>
                  {isEditing ? (
                    <Input
                      {...register('lastName', { required: 'Last name is required' })}
                      className={errors.lastName ? 'border-destructive' : ''}
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.lastName} />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Email Address"
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  error={errors.email?.message}
                >
                  {isEditing ? (
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className={errors.email ? 'border-destructive' : ''}
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.email} />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Phone Number"
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <PhoneInput
                          value={value}
                          onChange={onChange}
                          defaultCountry="KE"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500"
                          disabled={saving}
                        />
                      )}
                    />
                  ) : (
                    <DisplayValue value={currentValues.phone} placeholder="Add phone number" />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Date of Birth"
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? field.value.split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                          disabled={saving}
                        />
                      )}
                    />
                  ) : (
                    <DisplayValue
                      value={currentValues.dateOfBirth ? new Date(currentValues.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined}
                      placeholder="Add date of birth"
                    />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Location"
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Input
                      {...register('location')}
                      placeholder="City, Country"
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.location} placeholder="Add location" />
                  )}
                </FormFieldWrapper>
              </div>
            </div>

            {/* Student Information Section */}
            <div className="pt-6 border-t border-neutral-lighter mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <School className="h-4 w-4 text-brand-primary" />
                Student Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWrapper
                  label="University"
                  icon={<School className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Input
                      {...register('university')}
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.university} />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Major / Field of Study"
                  icon={<BookOpen className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Input
                      {...register('major')}
                      placeholder="e.g., Computer Science"
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.major} placeholder="Add your major" />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper label="Student ID">
                  {isEditing ? (
                    <Input
                      {...register('studentId')}
                      placeholder="Your student ID number"
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue value={currentValues.studentId} placeholder="Add student ID" />
                  )}
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Expected Graduation"
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                >
                  {isEditing ? (
                    <Input
                      type="month"
                      {...register('graduationYear')}
                      min={`${new Date().getFullYear()}-01`}
                      max={`${new Date().getFullYear() + 8}-12`}
                      disabled={saving}
                    />
                  ) : (
                    <DisplayValue
                      value={currentValues.graduationYear ? new Date(currentValues.graduationYear).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : undefined}
                      placeholder="Add graduation date"
                    />
                  )}
                </FormFieldWrapper>
              </div>
            </div>

            {/* Unsaved changes indicator */}
            {isEditing && isDirty && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg mt-6">
                <AlertCircle className="h-4 w-4" />
                You have unsaved changes
              </div>
            )}
          </form>
        </CardContent>
        {/* Edit / Save / Cancel buttons */}
        <div className="flex items-center gap-2 m-4 justify-end">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                form="profile-form"
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleEditClick}
              className="hover:border-brand-primary hover:text-brand-primary"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Security Settings Card */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
              <div className="relative mt-1.5">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium h-4 w-4" />
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="pl-10 pr-10"
                  disabled={changingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                className="mt-1.5"
                disabled={changingPassword}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                className="mt-1.5"
                disabled={changingPassword}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handlePasswordChange}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            disabled={changingPassword}
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-brand-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your account data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-neutral-lighter rounded-lg">
            <div>
              <h3 className="font-medium text-lg text-text-primary">Export Data</h3>
              <p className="text-sm text-neutral-medium">Request a copy of your data</p>
            </div>
            <Button type="button" variant="outline" className="hover:border-brand-primary hover:text-brand-primary mt-4 md:mt-0">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-medium text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Delete Account
              </h3>
              <p className="text-sm text-neutral-medium">Permanently delete your account and all data</p>
            </div>
            <Button className='mt-4 md:mt-0' type="button" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
