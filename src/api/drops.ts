import axiosInstance from '@/api/axios';

export const CAMPAIGN_SLUG = 'studentxmas';
export const INSTAGRAM_URL = 'https://www.instagram.com/studentxafrica';
export const INSTAGRAM_HANDLE = '@studentxafrica';

export type DropKind = 'airtime' | 'voucher' | 'crew';
// not_verified: joined, but the student ID wasn't verified by the pick time.
export type DropResult = 'picked' | 'not_picked' | 'not_verified' | 'not_in' | null;
export type MemberState = 'visitor' | 'signed_in' | 'joined';
export type VerificationState = 'verified' | 'in_review' | 'rejected' | 'unverified' | null;

export interface Drop {
	id: string;
	number: number;
	total: number;
	title: string;
	brand: string;
	description: string | null;
	/** Card badge and the line under the card title, e.g. "DROPS MON & FRI". */
	badge: string | null;
	subtext: string | null;
	coverImage: string | null;
	kind: DropKind;
	quantity: number;
	crewSize: number | null;
	pickAt: string;
	useWithinDays: number;
	status: 'upcoming' | 'ended';
	isNext: boolean;
	pickedCount: number | null;
	result: DropResult;
}

export interface Member {
	state: MemberState;
	verification: VerificationState;
	joinedAt: string | null;
	phone: string | null;
	hasPhone: boolean;
	picks: number;
}

export interface CampaignView {
	campaign: { slug: string; name: string; startsAt: string; endsAt: string; termsVersion: string };
	member: Member;
	nextDrop: Drop | null;
	latestResult: Drop | null;
	upcoming: Drop[];
	ended: Drop[];
}

export interface CrewFriend {
	firstName: string;
	initials: string;
	status: 'verified' | 'in_review' | 'unverified';
}

export interface DropPick {
	id: string;
	drop: { id: string; title: string; brand: string; kind: DropKind; pickAt: string; crewSize: number | null };
	pickedAt: string;
	expiresAt: string;
	reference: string;
	fulfilment: 'pending' | 'sent' | 'redeemed';
	redeemedAt: string | null;
	crewCode: string | null;
	crew: CrewFriend[];
	crewComplete: boolean;
	passAvailable: boolean;
	phone: string | null;
}

export interface LivePass {
	code: string;
	secondsLeft: number;
	serverTime: string;
	holder: { firstName: string; lastName: string; school: string | null };
	crew: string[];
	drop: { title: string; brand: string; kind: DropKind };
	reference: string;
	expiresAt: string;
	redeemedAt: string | null;
}

// Pages that work signed in or not must not bounce visitors to the sign-in page.
const quiet = { skipAuthRedirect: true };

export const getCampaign = async () =>
	(await axiosInstance.get(`/drops/campaigns/${CAMPAIGN_SLUG}`, quiet)).data.data as CampaignView;

export const getDrop = async (dropId: string) =>
	(await axiosInstance.get(`/drops/campaigns/${CAMPAIGN_SLUG}/drops/${dropId}`, quiet)).data.data as {
		drop: Drop; member: Member; nextDrop: Drop | null; campaign: CampaignView['campaign'];
	};

export const joinCampaign = async (phone?: string) =>
	(await axiosInstance.post(`/drops/campaigns/${CAMPAIGN_SLUG}/join`, { acceptTerms: true, phone })).data.data as CampaignView;

export const getMyPicks = async () => (await axiosInstance.get('/drops/me/picks')).data.data as DropPick[];

export const getPick = async (pickId: string) => (await axiosInstance.get(`/drops/picks/${pickId}`)).data.data as DropPick;

export const getLivePass = async (pickId: string) =>
	(await axiosInstance.get(`/drops/picks/${pickId}/pass`)).data.data as LivePass;

export const getCrewInvite = async (code: string) =>
	(await axiosInstance.get(`/drops/crew/${code}`, quiet)).data.data as {
		inviterFirstName: string; drop: { title: string; brand: string; crewSize: number }; spotsLeft: number; expiresAt: string;
	};

export const joinCrew = async (code: string) => axiosInstance.post(`/drops/crew/${code}/join`);

export const checkPass = async (code: string) =>
	(await axiosInstance.get('/drops/passes/check', { params: { code }, ...quiet })).data.data as {
		valid: boolean; reason: string | null; firstName?: string; perk?: string; brand?: string;
		crewSize?: number | null; reference?: string; expiresAt?: string;
	};

export const redeemPass = async (code: string, pin: string) =>
	axiosInstance.post('/drops/passes/redeem', { code, pin }, quiet);

// Formatting ---------------------------------------------------------------

const EAT = 'Africa/Nairobi';

export const formatDropDay = (iso: string) =>
	new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: EAT });

export const formatDropTime = (iso: string) =>
	new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: EAT });

export const formatDropWhen = (iso: string) => `${formatDropDay(iso)}, ${formatDropTime(iso)}`;

/** Calendar days in Nairobi from today until the drop: 0 today, 1 tomorrow. */
const daysUntil = (iso: string) => {
	const day = (d: Date) => new Date(d.toLocaleDateString('en-CA', { timeZone: EAT })).getTime();
	return Math.round((day(new Date(iso)) - day(new Date())) / 86_400_000);
};

/** "Today", "Tomorrow", "In 5 days". */
export const countdownLabel = (iso: string) => {
	const days = daysUntil(iso);
	return days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
};

/** Drops that share a title are one reward card (the six KSh 250 airtime drops). */
export const rewardKey = (drop: Pick<Drop, 'title'>) => drop.title.trim().toLowerCase();

export interface Reward {
	key: string;
	drops: Drop[];
	/** The drop the card shows: the reward's next drop, or its last one once all have ended. */
	shown: Drop;
	unlocked: boolean;
}

/** One card per reward: rewards still to drop first (soonest first), then unlocked ones (latest first). */
export const groupRewards = (drops: Drop[]): Reward[] => {
	const groups = new Map<string, Drop[]>();
	for (const drop of [...drops].sort((a, b) => a.pickAt.localeCompare(b.pickAt))) {
		const key = rewardKey(drop);
		groups.set(key, [...(groups.get(key) ?? []), drop]);
	}
	const rewards = [...groups.entries()].map(([key, list]) => {
		const next = list.find((d) => d.status === 'upcoming');
		return { key, drops: list, shown: next ?? list[list.length - 1], unlocked: !next };
	});
	const open = rewards.filter((r) => !r.unlocked).sort((a, b) => a.shown.pickAt.localeCompare(b.shown.pickAt));
	const done = rewards.filter((r) => r.unlocked).sort((a, b) => b.shown.pickAt.localeCompare(a.shown.pickAt));
	return [...open, ...done];
};

/** The next drop of each reward, soonest first. */
export const nextOfEachReward = (upcoming: Drop[]) => groupRewards(upcoming).filter((r) => !r.unlocked).map((r) => r.shown);

/** "28 Verified Winners • Nov 18 - Dec 18 • All rewards valid for 10 days from unlock." */
export const campaignBannerText = (view: CampaignView) => {
	const drops = [...view.upcoming, ...view.ended];
	const winners = drops.reduce((sum, d) => sum + d.quantity * (d.kind === 'crew' ? d.crewSize ?? 1 : 1), 0);
	const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: EAT });
	const days = Math.max(...drops.map((d) => d.useWithinDays), 0);
	return `${winners} Verified Winners • ${day(view.campaign.startsAt)} - ${day(view.campaign.endsAt)} • All rewards valid for ${days} days from unlock.`;
};

export const kindLabel = (kind: DropKind) => (kind === 'airtime' ? 'Airtime' : kind === 'crew' ? 'Experience' : 'Voucher');

export const apiMessage = (error: unknown, fallback: string) => {
	const data = (error as { response?: { data?: { message?: string; description?: string } } })?.response?.data;
	return data?.description ? `${data.message}. ${data.description}` : data?.message || fallback;
};

type Pick_<T, K extends keyof T> = { [P in K]: T[P] };
