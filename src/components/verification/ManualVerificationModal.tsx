import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog";
import { Upload, X, CheckCircle, AlertCircle, FileText, Camera, User, GraduationCap, Mail, Phone, Calendar, School, Clock, Eye, Trash2, RefreshCw } from "lucide-react";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";

interface StudentVerificationData {
	personalInfo: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		dateOfBirth: string;
	};
	academicInfo: {
		institution: string;
		studentId: string;
		program: string;
		year: string;
		expectedGraduation: string;
	};
	documents: Array<{
		id: string;
		file: File;
		type: 'student_id' | 'enrollment_proof' | 'transcript';
		preview: string;
		status: 'uploading' | 'uploaded' | 'error';
	}>;
}

interface VerificationStatus {
	status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'info_requested';
	submissionDate?: string;
	lastUpdate?: string;
	feedback?: string;
	requestId?: string;
}

const StudentVerificationModal: React.FC<{
	student: any;
	isOpen: boolean;
	onClose: () => void;
	currentStatus?: VerificationStatus;
	onSubmit?: (data: StudentVerificationData) => void;
	onResubmit?: (data: StudentVerificationData) => void;
}> = ({
	student,
	isOpen,
	onClose,
	currentStatus,
	onSubmit,
	onResubmit
}) => {
		const [step, setStep] = useState(1);
		const [isSubmitting, setIsSubmitting] = useState(false);
		const [formData, setFormData] = useState<StudentVerificationData>({
			personalInfo: {
				firstName: student.firstName || '',
				lastName: student.lastName || '',
				email: student.email || '',
				phone: student.phone || '',
				dateOfBirth: student.dateOfBirth || ''
			},
			academicInfo: {
				institution: student?.university || '',
				studentId: student?.studentId || '',
				program: student?.major || '',
				year: student?.year || '',
				expectedGraduation: student?.graduationYear || ''
			},
			documents: []
		});

		const fileInputRefs = {
			student_id: useRef<HTMLInputElement>(null),
			enrollment_proof: useRef<HTMLInputElement>(null),
			transcript: useRef<HTMLInputElement>(null)
		};

		// Sample status for demonstration
		const defaultStatus: VerificationStatus = {
			status: 'not_submitted'
		};

		const status = currentStatus || defaultStatus;

		const getStatusDisplay = () => {
			switch (status.status) {
				case 'pending':
					return {
						icon: <Clock className="w-5 h-5 text-yellow-500" />,
						text: 'To be Reviewed',
						color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
						description: 'Your verification will be reviewed by our team. Please keep an eye on your email for updates.',
					};
				case 'approved':
					return {
						icon: <CheckCircle className="w-5 h-5 text-green-500" />,
						text: 'Verified',
						color: 'bg-green-50 border-green-200 text-green-800',
						description: 'Your student status has been verified! You now have access to all student benefits.'
					};
				case 'rejected':
					return {
						icon: <X className="w-5 h-5 text-red-500" />,
						text: 'Rejected',
						color: 'bg-red-50 border-red-200 text-red-800',
						description: 'Your verification was declined. Please review the feedback below and resubmit.'
					};
				case 'info_requested':
					return {
						icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
						text: 'Info Requested',
						color: 'bg-blue-50 border-blue-200 text-blue-800',
						description: 'Additional information is needed to complete your verification.'
					};
				default:
					return {
						icon: <FileText className="w-5 h-5 text-gray-500" />,
						text: 'Not Submitted',
						color: 'bg-gray-50 border-gray-200 text-gray-800',
						description: 'Complete the form below to verify your student status.'
					};
			}
		};

		const handleFileUpload = (type: 'student_id' | 'enrollment_proof' | 'transcript', files: FileList | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];
			const maxSize = 5 * 1024 * 1024; // 5MB

			if (file.size > maxSize) {
				alert('File size must be less than 5MB');
				return;
			}

			const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
			if (!validTypes.includes(file.type)) {
				alert('Please upload a PDF, JPG, or PNG file');
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const newDocument = {
					id: Date.now().toString(),
					file,
					type,
					preview: e.target?.result as string,
					status: 'uploaded' as const
				};

				setFormData(prev => ({
					...prev,
					documents: [...prev.documents.filter(doc => doc.type !== type), newDocument]
				}));
			};

			reader.readAsDataURL(file);
		};

		const removeDocument = (type: 'student_id' | 'enrollment_proof' | 'transcript') => {
			setFormData(prev => ({
				...prev,
				documents: prev.documents.filter(doc => doc.type !== type)
			}));
		};

		const getDocumentByType = (type: 'student_id' | 'enrollment_proof' | 'transcript') => {
			return formData.documents.find(doc => doc.type === type);
		};

		const handleSubmit = async () => {
			// Validation
			if (!formData.personalInfo.firstName || !formData.personalInfo.lastName || !formData.personalInfo.email) {
				alert('Please fill in all required personal information');
				return;
			}

			if (!formData.academicInfo.institution || !formData.academicInfo.studentId || !formData.academicInfo.program) {
				alert('Please fill in all required academic information');
				return;
			}

			if (formData.documents.length < 1) {
				alert('Please upload at least one document with enough information');
				return;
			}

			try {
				setIsSubmitting(true);
				// Format dateOfBirth to YYYY-MM-DD format without time component
				const personalInfo = {
					...formData.personalInfo,
					dateOfBirth: formData.personalInfo.dateOfBirth ? formData.personalInfo.dateOfBirth.split('T')[0] : ''
				};
				const payload = new FormData();
				payload.append('personalInfo', JSON.stringify(personalInfo));
				payload.append('academicInfo', JSON.stringify(formData.academicInfo));
				payload.append('documentsMeta', JSON.stringify(
					formData.documents.map(doc => ({
						type: doc.type,
						size: doc.file.size,
						name: doc.type === 'student_id' ? 'Student ID' : doc.type === 'enrollment_proof' ? 'Enrollment Proof' : doc.type === 'transcript' ? 'Transcript' : 'Other'
					}))
				));
				formData.documents.forEach((doc) => {
					payload.append('documents', doc.file, doc.file.name);
				});
				const response = await axiosInstance.post('/user/verification/student/submit', payload, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});
				if (response.status === 200 || response.status === 201) {
					toast({
						title: 'Verification Submitted',
						description: 'Your student verification has been successfully submitted.',
						variant: 'success'
					});
					onSubmit?.(formData);
					onClose();
				}
			} catch (error) {
				toast({
					title: error.response?.data?.message || 'Submission Failed',
					description: error.response?.message || 'There was an error submitting your verification. Please try again later.',
					variant: 'destructive'
				});

				return;
			} finally {
				setIsSubmitting(false);
			}


		};

		const renderStatusSection = () => {
			const statusDisplay = getStatusDisplay();

			return (
				<div className={`border rounded-lg p-4 ${statusDisplay.color}`}>
					<div className="flex items-center gap-3 mb-2">
						{statusDisplay.icon}
						<div>
							<h3 className="font-semibold text-lg">{statusDisplay.text}</h3>
							{status.requestId && (
								<p className="text-sm opacity-75">Request ID: {status.requestId}</p>
							)}
						</div>
					</div>
					<p className="text-xs mb-2">{statusDisplay.description}</p>

					{status.submissionDate && (
						<p className="text-xs opacity-75">
							Submitted: {new Date(status.submissionDate).toLocaleDateString()}
						</p>
					)}

					{status.lastUpdate && (
						<p className="text-xs opacity-75">
							Last Updated: {new Date(status.lastUpdate).toLocaleDateString()}
						</p>
					)}
				</div>
			);
		};

		const renderFeedbackSection = () => {
			if (!status.feedback) return null;

			return (
				<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
					<h4 className="font-medium mb-2 flex items-center gap-2">
						<Mail className="w-4 h-4" />
						Message from Verification Team
					</h4>
					<div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap">
						{status.feedback}
					</div>
				</div>
			);
		};

		const renderPersonalInfoStep = () => (
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							First Name *
						</label>
						<input
							type="text"
							value={formData.personalInfo.firstName}
							onChange={(e) => setFormData(prev => ({
								...prev,
								personalInfo: { ...prev.personalInfo, firstName: e.target.value }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your first name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Last Name *
						</label>
						<input
							type="text"
							value={formData.personalInfo.lastName}
							onChange={(e) => setFormData(prev => ({
								...prev,
								personalInfo: { ...prev.personalInfo, lastName: e.target.value }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your last name"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email Address *
					</label>
					<input
						type="email"
						value={formData.personalInfo.email}
						onChange={(e) => setFormData(prev => ({
							...prev,
							personalInfo: { ...prev.personalInfo, email: e.target.value }
						}))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Enter your email address"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<PhoneInput
							// type="tel"
							value={formData.personalInfo.phone}
							defaultCountry='KE'
							onChange={(value) => setFormData(prev => ({
								...prev,
								personalInfo: { ...prev.personalInfo, phone: value || '' }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 ring-none"
							placeholder="Enter your phone number"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Date of Birth
						</label>
						<input
							type="date"
							min={new Date(new Date().setFullYear(new Date().getFullYear() - 30)).toISOString().split("T")[0]} // Not older than 30 years
							max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} // must be 18 or older
							value={formData.personalInfo.dateOfBirth ? formData.personalInfo.dateOfBirth.split('T')[0] : ''}
							onChange={(e) => setFormData(prev => ({
								...prev,
								personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
			</div>
		);

		const renderAcademicInfoStep = () => (
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Institution/University *
					</label>
					<input
						type="text"
						value={formData.academicInfo.institution}
						onChange={(e) => setFormData(prev => ({
							...prev,
							academicInfo: { ...prev.academicInfo, institution: e.target.value }
						}))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., University of California, Berkeley"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Student ID *
						</label>
						<input
							type="text"
							value={formData.academicInfo.studentId}
							onChange={(e) => setFormData(prev => ({
								...prev,
								academicInfo: { ...prev.academicInfo, studentId: e.target.value }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., 12345678"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Academic Year *
						</label>
						<select
							value={formData.academicInfo.year}
							onChange={(e) => setFormData(prev => ({
								...prev,
								academicInfo: { ...prev.academicInfo, year: e.target.value }
							}))}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Select year</option>
							<option value="1">1st Year</option>
							<option value="2">2nd Year</option>
							<option value="3">3rd Year</option>
							<option value="4">4th Year</option>
							<option value="5">5th Year+</option>
							<option value="graduate">Graduate Student</option>
						</select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Program/Major *
					</label>
					<input
						type="text"
						value={formData.academicInfo.program}
						onChange={(e) => setFormData(prev => ({
							...prev,
							academicInfo: { ...prev.academicInfo, program: e.target.value }
						}))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., Computer Science, Business Administration"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Expected Graduation
					</label>
					<input
						type="month"
						value={formData.academicInfo.expectedGraduation}
						onChange={(e) => setFormData(prev => ({
							...prev,
							academicInfo: { ...prev.academicInfo, expectedGraduation: e.target.value }
						}))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		);

		const DocumentUploadCard = ({
			type,
			title,
			description,
			required = false,
			icon
		}: {
			type: 'student_id' | 'enrollment_proof' | 'transcript';
			title: string;
			description: string;
			required?: boolean;
			icon: React.ReactNode;
		}) => {
			const document = getDocumentByType(type);

			return (
				<div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
					<div className="flex items-start gap-3 mb-3">
						{icon}
						<div className="flex-1">
							<h4 className="font-medium text-base text-gray-900">
								{title}
								{required && <span className="text-red-500 ml-1 text-sm">*</span>}
							</h4>
							<p className="text-sm text-gray-600 mt-1">{description}</p>
						</div>
					</div>

					{document ? (
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-600" />
									<div>
										<p className="font-medium text-sm text-green-900">{document.file.name}</p>
										<p className="text-xs text-green-700">
											{(document.file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									{/* {document.file.type.startsWith('image/') && (
										<button
											onClick={() => window.open(document.preview, '_blank')}
											className="p-2 text-green-600 hover:bg-green-100 rounded"
										>
											<Eye className="w-4 h-4" />
										</button>
									)} */}
									<button
										onClick={() => removeDocument(type)}
										className="p-2 text-red-600 hover:bg-red-100 rounded"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
							<button
								onClick={() => fileInputRefs[type].current?.click()}
								className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 py-2"
							>
								<RefreshCw className="w-4 h-4" />
								Replace File
							</button>
						</div>
					) : (
						<button
							onClick={() => fileInputRefs[type].current?.click()}
							className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
						>
							<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-700">Click to upload</p>
							<p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 5MB)</p>
						</button>
					)}

					<input
						ref={fileInputRefs[type]}
						type="file"
						accept=".pdf,.jpg,.jpeg,.png"
						className="hidden"
						onChange={(e) => handleFileUpload(type, e.target.files)}
					/>
				</div>
			);
		};

		const renderDocumentsStep = () => (
			<div className="space-y-6">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
						<div>
							<h4 className="font-medium text-base text-blue-900">Document Requirements</h4>
							<ul className="text-xs text-blue-800 mt-2 space-y-1">
								<li>• All documents must be current and clearly readable</li>
								<li>• File size limit: 5MB per document</li>
								<li>• Accepted formats: PDF, JPG, PNG</li>
								<li>• Documents must match your personal information exactly</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="grid gap-4">
					<DocumentUploadCard
						type="student_id"
						title="Student ID"
						description="Current student ID showing your photo, name, and student number"
						required
						icon={<User className="w-5 h-5 text-blue-600" />}
					/>
					<p className="text-gray-400">Don't have an ID? Submit either of the following:</p>
					<DocumentUploadCard
						type="enrollment_proof"
						title="Proof of Enrollment"
						description="Official letter or document proving current enrollment status"
						required
						icon={<FileText className="w-5 h-5 text-green-600" />}
					/>

					<DocumentUploadCard
						type="transcript"
						title="Academic Transcript"
						description="Recent transcript showing your academic progress (unofficial acceptable)"
						icon={<GraduationCap className="w-5 h-5 text-purple-600" />}
					/>
				</div>
			</div>
		);

		const renderStepContent = () => {
			switch (step) {
				case 1:
					return renderPersonalInfoStep();
				case 2:
					return renderAcademicInfoStep();
				case 3:
					return renderDocumentsStep();
				default:
					return null;
			}
		};

		const canProceedToNextStep = () => {
			switch (step) {
				case 1:
					return formData.personalInfo.firstName && formData.personalInfo.lastName && formData.personalInfo.email && formData.personalInfo.dateOfBirth;
				case 2:
					return formData.academicInfo.institution && formData.academicInfo.studentId && formData.academicInfo.program;
				case 3:
					return formData.documents.length >= 1 && formData.documents.every(doc => doc.status === 'uploaded');
				default:
					return false;
			}
		};

		if (!isOpen) return null;

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
					<DialogHeader className="p-6 pb-4 border-b">
						<DialogTitle className="text-xl font-semibold">Student Verification</DialogTitle>
						<DialogDescription>
							Verify your student status to access exclusive student benefits and discounts
						</DialogDescription>
					</DialogHeader>

					<div className="p-6 space-y-6">
						{/* Current Status Section */}
						{status.status !== 'not_submitted' && renderStatusSection()}

						{/* Feedback Section */}
						{renderFeedbackSection()}

						{/* Progress Steps */}
						<div className="flex items-center justify-between mb-6">
							{[1, 2, 3].map((stepNumber) => (
								<div key={stepNumber} className="flex items-center flex-1">
									<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-600'
										}`}>
										{stepNumber}
									</div>
									<div className="ml-3 flex-1">
										<p className={`text-sm font-medium ${step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
											}`}>
											{stepNumber === 1 && 'Personal Info'}
											{stepNumber === 2 && 'Academic Info'}
											{stepNumber === 3 && 'Documents'}
										</p>
									</div>
									{stepNumber < 3 && (
										<div className={`h-1 flex-1 mx-4 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
											}`} />
									)}
								</div>
							))}
						</div>

						{/* Step Content */}
						<div className="min-h-[400px]">
							{renderStepContent()}
						</div>
					</div>

					{/* Navigation */}
					<DialogFooter className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
						<div className="flex-1 flex gap-3">
							{step > 1 && (
								<button
									onClick={() => setStep(step - 1)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Previous
								</button>
							)}

							{step < 3 ? (
								<button
									onClick={() => setStep(step + 1)}
									disabled={!canProceedToNextStep()}
									className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
								>
									Next Step
								</button>
							) : (
								<button
									onClick={handleSubmit}
									disabled={!canProceedToNextStep() || isSubmitting}
									className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
								>
									{isSubmitting ? (
										<>
											<RefreshCw className="w-4 h-4 animate-spin" />
											{status.status === 'rejected' || status.status === 'info_requested' ? 'Resubmitting...' : 'Submitting...'}
										</>
									) : (
										<>
											<CheckCircle className="w-4 h-4" />
											{status.status === 'rejected' || status.status === 'info_requested' ? 'Resubmit Verification' : 'Submit for Verification'}
										</>
									)}
								</button>
							)}
						</div>

						<button
							onClick={onClose}
							disabled={isSubmitting}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	};

export default StudentVerificationModal;
