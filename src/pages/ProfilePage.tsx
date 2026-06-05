import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	XCircle,
	Loader2
} from "lucide-react";
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { ProfileInfoSidebar } from '@/components/profile/ProfileInfoSidebar';
import { VerificationTasks } from "@/components/profile/Verification";
import { SavedDeals } from "@/components/profile/SavedDeals";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { OnboardingChecklist } from "@/components/profile/OnboardingChecklist";
import { CouponTracker } from '@/components/profile/CouponTracker';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { StudentBusinessPromo } from '@/components/profile/StudentBusinessPromo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';
import profileCoverImage from '@/assets/images/formatted.webp';


const Profile = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const [activeTab, setActiveTabFn] = useState(urlParams.get('tab') || "account");
	const [userData, setUserData] = useState(null);
	const [fetchingProfile, setFetchingProfile] = useState(false);

	// Onboarding wizard state
	const shouldShowOnboarding = urlParams.get('onboarding') === 'true';
	const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

	const setActiveTab = (tab: string) => {
		const [xtab, params] = tab.split('?');
		setActiveTabFn(xtab);
		urlParams.set('tab', xtab);
		// Remove onboarding param when switching tabs
		urlParams.delete('onboarding');
		window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
		if (params) {
			// Handle any additional params (like scrollTo)
			const paramPairs = new URLSearchParams(params);
			const scrollToId = paramPairs.get('scrollTo');
			if (scrollToId) {
				// Wait for the DOM to update after tab change before scrolling
				setTimeout(() => {
					const element = document.getElementById(scrollToId);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth' });
					}
				}, 100);
			}
		}
	};

	const fetchUserData = async () => {
		try {
			setFetchingProfile(true);
			const response = await axiosInstance.get('/user/me');
			if (response.status !== 200) {
				throw new Error("No user data found");
			}
			setUserData(response.data.data);
		} catch (error) {

			toast({
				title: error.response.data.message || error.message || "Error populating profile",
				description: error.response.data.description || "Failed to load user data. Please try again later.",
				variant: "destructive"
			})
		} finally {
			setFetchingProfile(false);
		}
	}

	useEffect(() => {
		fetchUserData();
	}, []);

	// Check for onboarding trigger after user data is loaded
	useEffect(() => {
		if (userData && shouldShowOnboarding) {
			const onboardingCompleted = localStorage.getItem('onboarding_completed');
			if (!onboardingCompleted) {
				setShowOnboardingWizard(true);
			}
			// Clean up URL
			urlParams.delete('onboarding');
			window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
		}
	}, [userData, shouldShowOnboarding]);

	// Handle onboarding wizard completion
	const handleOnboardingComplete = () => {
		setShowOnboardingWizard(false);
		// Clear new user flag
		localStorage.removeItem('is_new_user');
		// Refresh user data to get any updates made during onboarding
		fetchUserData();
		toast({
			title: 'Welcome to StudentX!',
			description: 'Your profile is set up. Start exploring exclusive student deals!',
			variant: 'default'
		});
	};

	// Handle onboarding wizard close (skip)
	const handleOnboardingClose = () => {
		setShowOnboardingWizard(false);
		// Clean up URL
		urlParams.delete('onboarding');
		window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
	};

	// Open onboarding wizard manually (from checklist)
	const handleOpenOnboarding = () => {
		setShowOnboardingWizard(true);
	};

	// Check if profile needs completion (for checklist)
	const isProfileIncomplete = userData && (
		!userData.phone ||
		!userData.major ||
		!userData.studentId ||
		!userData.isVerified
	);

	return (
		<div className="min-h-screen bg-background-lighter font-sans">
			<div className='flex w-full justify-center'>
				<Header />
			</div>
			{fetchingProfile ? (
				<div className="min-h-screen flex items-center justify-center bg-background-lighter">
					<Card className="w-full max-w-md border-none shadow-none bg-transparent">
						<CardContent className="text-center">
							<Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-brand-primary" />
							<p className="text-lg text-text-primary font-medium">Loading your profile...</p>
						</CardContent>
					</Card>
				</div>
			) : !userData ? (
				<div className="min-h-screen flex items-center justify-center bg-background-lighter">
					<Card className="w-full max-w-md">
						<CardContent className="text-center p-8">
							<XCircle className="h-12 w-12 mx-auto mb-4 text-destructive/80" />
							<p className="text-xl font-bold text-text-primary mb-2">Profile not found</p>
							<p className="text-text-secondary mb-6">Please check your account or contact support.</p>
							<Button onClick={() => window.location.reload()}>Try Again</Button>
						</CardContent>
					</Card>
				</div>
			) : (
				<div className="pb-20">
					{/* Onboarding Wizard */}
					{showOnboardingWizard && userData && (
						<OnboardingWizard
							isOpen={showOnboardingWizard}
							onClose={handleOnboardingClose}
							onComplete={handleOnboardingComplete}
							user={userData}
						/>
					)}

					{/* Banner */}
					<ProfileBanner coverImage={profileCoverImage} />

					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							{/* Left Column: Sidebar Info */}
							<div className="lg:col-span-3 lg:block -mt-16 sm:-mt-20">
								<div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
									<ProfileInfoSidebar user={userData} />
								</div>
							</div>

							{/* Right Column: Content */}
							<div className="lg:col-span-9 mt-8 lg:mt-12">
								<div className="mb-8">
									<StudentBusinessPromo promotion={userData?.studentBusinessPromotion} />
								</div>

								{/* Tabs Navigation - Underline Style */}
								<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
									<div className="border-b border-neutral-lighter mb-8 overflow-x-auto">
										<TabsList className="h-auto p-0 bg-transparent gap-6 w-full justify-start rounded-none">
											<TabsTrigger
												value="account"
												className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-primary px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
											>
												Account
											</TabsTrigger>
											<TabsTrigger
												value="verification"
												className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-primary px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
											>
												Verification
											</TabsTrigger>
											<TabsTrigger
												value="coupons"
												className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-primary px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
											>
												Coupons
											</TabsTrigger>
											<TabsTrigger
												value="saved"
												className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-primary px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
											>
												Saved
											</TabsTrigger>
											<TabsTrigger
												value="preferences"
												className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-primary px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
											>
												Settings
											</TabsTrigger>
										</TabsList>
									</div>

									{/* Onboarding Checklist - shows for users with incomplete profiles */}
									{isProfileIncomplete && !showOnboardingWizard && (
										<div className="mb-8">
											<OnboardingChecklist
												user={userData}
												onNavigateToTab={setActiveTab}
												onOpenOnboarding={handleOpenOnboarding}
												onDismiss={() => { }}
											/>
										</div>
									)}

									{/* Tab Contents */}
									<div className="min-h-100">
										<TabsContent value="account" className="mt-0 focus-visible:outline-none">
											<div>
												<h2 className="text-xl font-bold text-text-primary mb-1">Account Details</h2>
												<p className="text-text-secondary mb-6">Manage your personal information and contact details.</p>
												<AccountSettings user={userData} />
											</div>
										</TabsContent>

										<TabsContent value="verification" className="mt-0 focus-visible:outline-none">
											<div>
												<div className="flex items-center justify-between mb-6">
													<div>
														<h2 className="text-xl font-bold text-text-primary mb-1">Student Verification</h2>
														<p className="text-text-secondary">Verify your status to unlock inclusive deals.</p>
													</div>
													{userData.isVerified && <Badge className="bg-success/10 text-success hover:bg-success/20 border-none px-3 py-1">Verified</Badge>}
												</div>
												<VerificationTasks onChangeTab={setActiveTab} user={userData} />
											</div>
										</TabsContent>

										<TabsContent value="coupons" className="mt-0 focus-visible:outline-none">
											<div>
												<h2 className="text-xl font-bold text-text-primary mb-6">Your Coupons</h2>
												<CouponTracker user={userData} />
											</div>
										</TabsContent>

										<TabsContent value="saved" className="mt-0 focus-visible:outline-none">
											<div>
												<h2 className="text-xl font-bold text-text-primary mb-6">Saved Deals</h2>
												<SavedDeals user={userData} />
											</div>
										</TabsContent>

										<TabsContent value="preferences" className="mt-0 focus-visible:outline-none">
											<div>
												<h2 className="text-xl font-bold text-text-primary mb-1">Preferences</h2>
												<p className="text-text-secondary mb-6">Manage your notification settings and preferences.</p>
												<PreferencesSettings user={userData} />
											</div>
										</TabsContent>
									</div>
								</Tabs>
							</div>
						</div>
					</div>
				</div>
			)}
			<Footer />
		</div>
	);
};

export default Profile;
