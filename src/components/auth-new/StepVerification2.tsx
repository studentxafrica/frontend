import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, FileText, User, GraduationCap, Loader2, RefreshCw } from 'lucide-react';
import axiosInstance from '@/api/axios';

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
	const [documents, setDocuments] = useState<Array<{ type: string; file: File; id: string }>>([]);
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
		const file = files[0];
		if (file.size > 5 * 1024 * 1024) return alert('Max file size is 5MB');

		setDocuments(prev => [...prev, {
			type: 'student_id', // Simplify to just student ID for this flow or allow selection
			file,
			id: Date.now().toString()
		}]);
	};

	const removeDocument = (id: string) => {
		setDocuments(prev => prev.filter(d => d.id !== id));
	};

	const submitVerification = async () => {
		setLoading(true);
		try {
			const personalInfo = {
				firstName: userData.firstName,
				lastName: userData.lastName,
				email: userData.email,
				dateOfBirth: userData.dob,
				// phone not passed in props but needed? assume BE has it from user record
			};

			// We need to construct the payload as expected by the verified endpoint
			// Since we don't have all academic info in props, we'll collect it here

			const response = await axiosInstance.post('/user/verification/student/submit', {
				personalInfo,
				academicInfo: {
					institution: userData.university,
					...academicInfo
				},
				documents: documents.map(d => ({
					type: d.type,
					file: d.file, // Note: In real app we might need to upload to S3 first or send multipart
					name: 'Student ID',
					// preview: ...
				}))
			});

			if (response.status === 200 || response.status === 201) {
				onNext();
			}
		} catch (err) {
			console.error(err);
			// For demo purposes, we might just proceed if it fails (dev mode)
			// or show error
			alert('Verification submission failed (Mock mode: check console)');
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
							onChange={e => handleFileUpload(e.target.files)}
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
									<button onClick={() => removeDocument(doc.id)} className="text-slate-400 hover:text-red-500">
										<X size={16} />
									</button>
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
