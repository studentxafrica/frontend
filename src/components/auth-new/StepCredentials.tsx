import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Mail, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import { setCurrentUser } from '@/state/auth';
import { useDispatch } from 'react-redux';

interface StepCredentialsProps {
    onNext: (data: { email: string; password?: string; isLogin: boolean }) => void;
    initialEmail?: string;
}

export const StepCredentials: React.FC<StepCredentialsProps> = ({ onNext, initialEmail = '' }) => {
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false); // Determined after checking email
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    // Validate email format
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axiosInstance.post("/auth/user/check-email", { email });
            if (res.data.exists) {
                setIsLogin(true);
            } else {
                setIsLogin(false);
            }

            setStep('password');
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const response = await axiosInstance.post("/auth/user/login", { email, password });
                const { user, user_role } = response.data;
                dispatch(
                    setCurrentUser({
                        user: user,
                        role: user_role,
                    })
                );
                if (response.status === 200) {
                    onNext({ email, isLogin: true });
                }
            } else {
                // Try to register (or validate password for next step)
                // Check min length
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters');
                }

                // We just pass data to next step, the actual registration usually happens later 
                // OR we check if user exists here.
                // If we want to check if user exists:
                // We can allow "onNext" to proceed.
                // But if specific error "User exists", we catch it here.

                // NOTE: The previous flow sent data to `StepPersonalInfo` which did the registering.
                // BUT, we want to catch "Email Exists" *here* to switch them to login.

                // So: 
                // We can try a "dry run" or just rely on the fact that if we proceed to Personal Info 
                // and then submit, we might fail there.
                // better to fail fast.

                // Implementation: We'll assume successful "password setting" and move to next step.
                // If the user *actually* exists, we can catch it?

                // Wait, if I cannot check email existence without a call, I have to rely on proper Login/Register calls.

                // Let's try to Login first if we think it might be a user (or if isLogin is true).
                // If isLogin is false (Signup), we proceed.

                onNext({ email, password, isLogin: false });
            }
        } catch (err: any) {
            // Handle "Email already exists" (409) if we were trying to register? 
            // Or "Account not found" (404) if verifying logic?

            // Since we are just validating credentials here...

            // Let's handle the specific User Request:
            // "When a user tries to use an email that exists... met with 'Email already exists' error... fix that"

            // This likely happens at the END of the flow (StepPersonalInfo) in the old code, 
            // OR we are moving it here.

            // To solve this properly:
            // If we proceed to `StepPersonalInfo` and THEN get an error, we need to pass that error back?
            // Or better: The `StepPersonalInfo` calls register. If it fails with 409, it should tell the user.
            // But the user wants to "go back to edit" the email.

            // So, in `StepPersonalInfo`, if 409, we should allow going back.
            // BUT simpler: Do the check here if possible.

            // Let's implement a 'check' by attempting to Login with a dummy password? No that's bad security (lockout).

            // I will stick to: 
            // 1. Enter Email. 
            // 2. Enter Password.
            // 3. Submit.
            // 4. If Signup && Error == "User exists" -> Switch to Login mode automatically or ask user?

            //  Let's simulate the issue and fix:
            //  If I try to Signup and backend says "User exists":
            if (!isLogin && err.response?.status === 409) {
                setError('Account already exists.');
                // Offer switch to login
                setIsLogin(true);
            } else if (isLogin && err.response?.status === 404) {
                setError('Account not found.');
                setIsLogin(false);
            } else {
                setError(err.response?.data?.message || err.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    // Split-flow UI
    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    {step === 'email'
                        ? 'Welcome back!'
                        : isLogin ? 'Welcome back!' : 'Create an account'}
                </h2>
                <p className="text-slate-500">
                    {step === 'email'
                        ? 'Please enter your details to get started.'
                        : isLogin ? 'Enter your password to access your account.' : 'Set a password for your new account.'}
                </p>
            </div>

            <form onSubmit={step === 'email' && !isLogin ? handleEmailSubmit : handleFinalSubmit} className="space-y-5">

                {/* Email Input Step */}
                {step === 'email' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="name@university.edu"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Password Input Step */}
                {step === 'password' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Email Display / Edit */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 text-slate-500">
                                    <UserIcon />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signing in as</span>
                                    <span className="text-sm font-semibold text-slate-900 truncate">{email}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setError('');
                                }}
                                className="p-2 hover:bg-white rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors"
                                title="Edit email"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                {isLogin && (
                                    <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400"
                                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <div className="flex gap-1 text-xs text-slate-500 mt-1">
                                    <div className={`h-1 w-full rounded-full ${password.length > 0 ? (password.length >= 8 ? 'bg-green-500' : 'bg-red-300') : 'bg-slate-200'}`}></div>
                                    <span className="ml-1">{password.length >= 8 ? 'Strong' : 'Min 8 chars'}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-3 border border-red-100"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium">{error}</p>
                            {/* Proposed Fix: Explicit Action to Edit Email if it exists */}
                            {error.includes('exists') && !isLogin && (
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className="text-red-800 underline mt-1 font-medium hover:text-red-900"
                                >
                                    Switch to Log In?
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading || !email || (step === 'password' && !password)}
                    className="w-full hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-linear-to-r from-indigo-600 to-blue-600"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : step === 'email' ? (
                        <>
                            Continue
                            <ArrowRight size={20} />
                        </>
                    ) : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </>
                    )}
                </button>

                {step === 'password' && !isLogin && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                        By creating an account, you agree to our{' '}
                        <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
                            Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link to="/data-consent" className="text-indigo-600 hover:text-indigo-700 underline">
                            Data Consent
                        </Link>
                        .
                    </p>
                )}

                {step === 'password' && (
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            {isLogin ? "Need to create an account?" : "Already have an account?"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
