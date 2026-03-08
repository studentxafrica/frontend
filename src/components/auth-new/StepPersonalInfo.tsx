import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, User, Phone, School, Calendar } from 'lucide-react';
import axiosInstance from '@/api/axios';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


interface StepPersonalInfoProps {
    onNext: (data: { firstName: string; lastName: string; phone: string; university: string; dob: string }) => void;
    email: string;
    password?: string;
    initialData?: any;
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({ onNext, email, password, initialData }) => {
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [university, setUniversity] = useState(initialData?.university || '');
    const [dob, setDob] = useState(initialData?.dob || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !phone || !university || !dob) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // If we have a password, we are in signup mode, so we should create the user now
            if (password) {
                const response = await axiosInstance.post("/auth/user/consumer/register", {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password,
                    school: university,
                    // Extra fields might need a separate update call if register endpoint is strict
                });

                if (response.status === 201) {
                    // User created. Now update with extra details if needed (phone, dob)
                    // Login first if needed or use returned token.
                    // For now assume success and proceed to verification
                    // Ideally we'd log them in here automatically
                    onNext({ firstName, lastName, phone, university, dob });
                }
            } else {
                // We are in login mode but maybe missing info? 
                // Or this step is just for updating profile.
                // Let's assume onNext handles the flow logic
                onNext({ firstName, lastName, phone, university, dob });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Tell us about yourself
                </h2>
                <p className="text-slate-500">
                    We need a few more details to set up your student profile.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">First Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                placeholder="Jane"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Last Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                    <div className="relative phone-input-container">
                        {/* PhoneInput comes with its own styles, might need custom styling to match */}
                        <PhoneInput
                            value={phone}
                            onChange={(val) => setPhone(val || '')}
                            defaultCountry="KE"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black outline-none transition-all flex gap-2"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">University</label>
                    <div className="relative">
                        <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="Start typing your university..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
