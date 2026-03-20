import React, { useState, useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowLeft, ShieldCheck, Users } from 'lucide-react';

import { StepCredentials } from '../components/auth-new/StepCredentials';
import { StepPersonalInfo } from '../components/auth-new/StepPersonalInfo';
import { StepVerification } from '../components/auth-new/StepVerification';
import { setCurrentUser } from '@/state/auth';

// Types
export type AuthStep = 'credentials' | 'personal' | 'verification' | 'success';

interface AuthState {
    step: AuthStep;
    data: {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        university?: string;
        dob?: string;
    };
}

type AuthAction =
    | { type: 'SET_STEP'; payload: AuthStep }
    | { type: 'UPDATE_DATA'; payload: Partial<AuthState['data']> }
    | { type: 'RESET' };

const initialState: AuthState = {
    step: 'credentials',
    data: {}
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'UPDATE_DATA':
            return { ...state, data: { ...state.data, ...action.payload } };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};

const AuthNew = () => {
    const [state, dispatch] = useReducer(authReducer, initialState, (initial) => {
        const saved = localStorage.getItem('auth_flow_state');
        return saved ? JSON.parse(saved) : initial;
    });
    const query = new URLSearchParams(useLocation().search)
    const page = query.get('page')
    const next = query.get('next')
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('auth_flow_state', JSON.stringify(state));
    }, [state]);

    const goBack = () => {
        if (state.step === 'personal') {
            dispatch({ type: 'SET_STEP', payload: 'credentials' });
        } else if (state.step === 'verification') {
            dispatch({ type: 'SET_STEP', payload: 'personal' });
        } else {
            navigate('/');
        }
    };

    const handleCredentialsNext = (data: { email: string; password?: string; isLogin: boolean }) => {
        dispatch({ type: 'UPDATE_DATA', payload: { email: data.email, password: data.password } });
        if (data.isLogin) {
            localStorage.removeItem('auth_flow_state');
            navigate(next || '/me');
        } else {
            dispatch({ type: 'SET_STEP', payload: 'personal' });
        }
    };

    const handlePersonalNext = (data: { firstName: string; lastName: string; phone: string; university: string; dob: string }) => {
        dispatch({ type: 'UPDATE_DATA', payload: data });
        dispatch({ type: 'SET_STEP', payload: 'verification' });
    };

    const handleVerificationNext = () => {
        dispatch({ type: 'SET_STEP', payload: 'success' });
    };

    // Content for the left panel based on active step
    const infoContent = {
        credentials: {
            title: "Unlock Your Student Discounts",
            description: "Join thousands of students saving money on their favorite brands every day.",
            highlights: ["Exclusive deals from 100+ brands", "New offers added weekly", "Free to join, always"]
        },
        personal: {
            title: "Let's Personalize Your Experience",
            description: "Tell us a bit about yourself so we can recommend the best deals for you.",
            highlights: ["Deals tailored to your campus", "Categories you care about", "Smart notifications"]
        },
        verification: {
            title: "Verify & Start Saving",
            description: "Confirm your student status to access exclusive, verified-only discounts.",
            highlights: ["Quick verification process", "Your data stays private", "Unlock premium offers"]
        },
        success: {
            title: "Welcome to the Club!",
            description: "You're all set to start saving. Explore deals now.",
            highlights: ["Browse deals instantly", "Save your favorites", "Share with friends"]
        }
    };

    const currentInfo = infoContent[state.step];

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            {/* LEFT PANEL - IMAGE & INFO */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    {/* Using the user provided image path, assuming it's accessible via some local server or just embedded if we could. 
                 For a real app, this would be an import or URL. 
                 Since I can't "host" the local file easily for the browser to see without moving it to public,
                 I will assume it's moved to public or I'll use a placeholder that matches the description.
                 For this implementation, I'll use a high-quality Unsplash image that matches the "purple silhouette" vibe 
                 or a CSS gradient if the specific image is critical but hard to link.
                 
                 However, to be helpful, I'll use a gradient overlay that matches the user's screenshot request 
                 over a student-like background.
             */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-linear-to-br from-purple-900/90 to-indigo-900/90 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Header Logo */}
                <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
                    {/* <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10"> */}
                    <Zap size={24} className='text-brand-primary' fill="currentColor" />
                    {/* </div> */}
                    <span>StudentX</span>
                </div>

                {/* Dynamic Content */}
                <div className="relative z-10 max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state.step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-bold mb-6 leading-tight">
                                {currentInfo.title}
                            </h1>
                            <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                                {currentInfo.description}
                            </p>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-2 mb-4 text-indigo-300">
                                    <Users size={18} />
                                    <span className="text-sm font-medium">What you get</span>
                                </div>
                                <ul className="space-y-3">
                                    {currentInfo.highlights.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white/90">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-indigo-200/60">
                    © 2024 StudentX Inc. All rights reserved.
                </div>
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-6 flex justify-between items-center bg-white border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-900">
                        <Zap size={20} className="text-brand-primary" fill="currentColor" />
                        <span>StudentX</span>
                    </div>
                    <a target='_blank' href="mailto:support@studentx.co.ke"  className="text-sm text-slate-500">Help</a>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-full flex flex-col justify-center p-6 sm:p-12 md:p-24 max-w-2xl mx-auto">
                        {state.step !== 'credentials' && state.step !== 'success' && (
                            <button
                                onClick={goBack}
                                className="mb-8 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
                            >
                                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={state.step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                {state.step === 'credentials' && (
                                    <StepCredentials
                                        onNext={handleCredentialsNext}
                                        initialEmail={state.data.email}
                                    />
                                )}

                                {state.step === 'personal' && (
                                    <StepPersonalInfo
                                        onNext={handlePersonalNext}
                                        email={state.data.email!}
                                        password={state.data.password}
                                        initialData={state.data}
                                    />
                                )}

                                {state.step === 'verification' && (
                                    <StepVerification
                                        onNext={handleVerificationNext}
                                        userData={state.data}
                                    />
                                )}

                                {state.step === 'success' && (
                                    <div className="text-center py-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <ShieldCheck size={48} />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold mb-3 text-slate-900">You're verified!</h2>
                                        <p className="text-slate-500 mb-8 text-lg">
                                            Welcome to StudentX. Your documents have been submitted and your account is ready.
                                        </p>

                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('auth_flow_state');
                                                navigate('/me');
                                            }}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-semibold text-lg transition-all shadow-lg shadow-indigo-200"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </ AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthNew;
