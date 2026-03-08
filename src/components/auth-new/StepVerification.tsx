import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { toast } from '@/hooks/use-toast';

interface StepVerificationProps {
    onNext: () => void;
    userData: {
        firstName?: string;
        lastName?: string;
        university?: string;
        email?: string;
        dob?: string;
    };
}

export const StepVerification: React.FC<StepVerificationProps> = ({ onNext, userData }) => {
    type DocumentType = 'student_id' | 'enrollment_proof' | 'transcript';
    type DocumentRecord = { type?: DocumentType; file: File; id: string };
    const documentTypeOptions: Array<{ value: DocumentType; label: string }> = [
        { value: 'student_id', label: 'Student ID' },
        { value: 'enrollment_proof', label: 'Enrollment Proof' },
        { value: 'transcript', label: 'Transcript' }
    ];

    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [defaultDocumentType, setDefaultDocumentType] = useState<DocumentType | ''>('');
    const [loading, setLoading] = useState(false);
    const [academicInfo, setAcademicInfo] = useState({
        studentId: '',
        program: '',
        year: '',
        expectedGraduation: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const filesArray = Array.from(files);

        const maxSize = 5 * 1024 * 1024; // 5MB
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];

        const newDocuments: DocumentRecord[] = [];

        for (let index = 0; index < filesArray.length; index += 1) {
            const file = filesArray[index];
            if (file.size > maxSize) {
                alert(`File size must be less than 5MB: ${file.name}`);
                return;
            }
            if (!validTypes.includes(file.type)) {
                alert(`Please upload a PDF, JPG, or PNG file: ${file.name}`);
                return;
            }

            newDocuments.push({
                id: `${Date.now()}-${index}`,
                file,
                type: defaultDocumentType || undefined
            });
        }

        setDocuments(prev => [...prev, ...newDocuments]);
    };

    const removeDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const submitVerification = async () => {

        if (!academicInfo.program || !academicInfo.studentId || !academicInfo.expectedGraduation) {
            alert('Please fill in all required academic information');
            return;
        }

        if (documents.length < 1) {
            alert('Please upload at least one document with enough information');
            return;
        }
        if (documents.some(doc => !doc.type)) {
            alert('Please select a document type for each uploaded file');
            return;
        }

        const personalInfo = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            dateOfBirth: userData.dob,
        };

        try {
            setLoading(true);
            // Use FormData to properly send files
            const formData = new FormData();
            
            // Add personalInfo as JSON string
            formData.append('personalInfo', JSON.stringify({
                ...personalInfo,
                dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split('T')[0] : undefined
            }));
            
            // Add academicInfo as JSON string
            formData.append('academicInfo', JSON.stringify(academicInfo));
            
            // Add document metadata as JSON string
            const documentsMeta = documents.map(doc => ({
                type: doc.type as DocumentType,
                size: doc.file.size,
                name: doc.type ? (documentTypeOptions.find(option => option.value === doc.type)?.label || 'Other') : 'Other',
            }));
            formData.append('documentsMeta', JSON.stringify(documentsMeta));
            
            // Add actual files
            documents.forEach((doc, index) => {
                formData.append(`documents`, doc.file, doc.file.name);
            });

            const response = await axiosInstance.post('/user/verification/student/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200 || response.status === 201) {
                toast({
                    title: 'Verification Submitted',
                    description: 'Your student verification has been successfully submitted.',
                    variant: 'success'
                });
                onNext();
            }
        } catch (error) {
            toast({
                title: error.response?.data?.message || 'Submission Failed',
                description: error.response?.message || 'There was an error submitting your verification. Please try again later.',
                variant: 'destructive'
            });

            return;
        } finally {
            setLoading(false);
        }


    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Verify Student Status
                </h2>
                <p className="text-slate-500">
                    Upload a document to verify your enrollment at {userData.university}.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Academic Details</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Student ID</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md"
                                value={academicInfo.studentId}
                                onChange={e => setAcademicInfo({ ...academicInfo, studentId: e.target.value })}
                                placeholder="Student ID Number"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Major / Program</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md"
                                value={academicInfo.program}
                                onChange={e => setAcademicInfo({ ...academicInfo, program: e.target.value })}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Year</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                    value={academicInfo.year}
                                    onChange={e => setAcademicInfo({ ...academicInfo, year: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Graduation</label>
                                <input
                                    type="month"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={academicInfo.expectedGraduation}
                                    onChange={e => setAcademicInfo({ ...academicInfo, expectedGraduation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Document Upload</h3>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Default Type (Optional)</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md bg-white"
                            value={defaultDocumentType}
                            onChange={(e) => setDefaultDocumentType(e.target.value as DocumentType | '')}
                        >
                            <option value="">Select a default type</option>
                            {documentTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            You can set a default for new uploads, or choose a type per file below.
                        </p>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                        <Upload className="text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-900">Click to upload document</p>
                        <p className="text-xs text-slate-500">Student ID, Transcript, or Enrollment Letter</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />
                    </div>

                    {documents.length > 0 && (
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={16} className="text-slate-500 shrink-0" />
                                        <span className="text-sm truncate">{doc.file.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="text-xs border rounded-md px-2 py-1 bg-white"
                                            value={doc.type ?? ''}
                                            onChange={(e) => {
                                                const nextType = e.target.value as DocumentType | '';
                                                setDocuments(prev => prev.map(item => item.id === doc.id ? { ...item, type: nextType || undefined } : item));
                                            }}
                                        >
                                            <option value="">Select type</option>
                                            {documentTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => removeDocument(doc.id)} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={submitVerification}
                    disabled={loading || documents.length === 0 || !academicInfo.studentId}
                    className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                </button>
            </div>
        </div>
    );
};
