import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────────────────────

export interface FundraiserMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export interface GiftTier {
  id: string;
  minAmount: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  media: FundraiserMedia[];
  goalAmount: number;
  raisedAmount: number;
  creatorName: string;
  creatorType: 'individual' | 'organization';
  verificationStatus: 'pending' | 'approved';
  submittedAt: number;
  isPublished: boolean;
  orgName?: string;
  giftTiers: GiftTier[];
}

export interface DonationComment {
  id: string;
  postId: string;
  donorName: string | null; // null = anonymous
  amount: number;
  donationType: 'money' | 'ads';
  message: string;
  timestamp: number;
  rewardTierId?: string;
  certificateId?: string;
}

export interface VerificationStatus {
  type: 'individual' | 'organization' | null;
  status: 'pending' | 'approved';
  submittedAt: number;
  fullName?: string;
  orgName?: string;
  orgType?: string;
  website?: string;
}

export interface DonationRecord {
  id: string;
  postId: string;
  postTitle: string;
  creatorName: string;
  donorName: string | null;
  amount: number;
  donationType: 'money' | 'ads';
  message: string;
  timestamp: number;
  isAnonymous: boolean;
  rewardTier?: GiftTier | null;
  certificateId?: string;
}

export interface FundraiserAccount {
  type: 'individual' | 'organization' | null;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  nrcFrontUri: string;
  nrcBackUri: string;
  nrcSelfieUri: string;
  nrcVerified: boolean;
  orgCertificateUri: string;
  orgGroupPhoto1Uri: string;
  orgGroupPhoto2Uri: string;
  orgVerified: boolean;
  payoutMethod?: {
    method: 'bank' | 'mobile' | 'crypto';
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchCode?: string;
    mobileProvider?: string;
    mobileNumber?: string;
    cryptoType?: string;
    walletAddress?: string;
  } | null;
  createdAt: number;
  updatedAt: number;
}

export interface MyFundraiser {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  media: FundraiserMedia[];
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
}

export interface OTPRecord {
  email: string;
  code: string;
  phone: string;
  phoneCode: string;
  expiresAt: number;
}

// ── Storage Keys ───────────────────────────────────────────────────────

const KEY_FUNDRAISERS = '@pill_donations';
const KEY_COMMENTS = '@pill_donation_comments';
const KEY_ONBOARDED = '@pill_donations_onboarded';
const KEY_VERIFICATION = '@pill_verification_status';
const KEY_ACCOUNT = '@pill_fundraiser_account';
const KEY_OTP = '@pill_otp_codes';
const KEY_MY_FUNDRAISERS = '@pill_my_fundraisers';

// ── Fundraisers ────────────────────────────────────────────────────────

export async function getFundraisers(): Promise<Fundraiser[]> {
  const raw = await AsyncStorage.getItem(KEY_FUNDRAISERS);
  let fundraisers: Fundraiser[] = raw ? JSON.parse(raw) : [];

  // Seed if empty
  if (fundraisers.length === 0) {
    fundraisers = await seedDummyData();
  }

  return fundraisers.filter((f) => f.isPublished);
}

export async function createFundraiser(data: Partial<Fundraiser>): Promise<Fundraiser> {
  const fundraisers = await getStoredFundraisers();
  const fundraiser: Fundraiser = {
    id: `fundraiser-${Date.now()}`,
    title: data.title || 'Untitled Fundraiser',
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    media: data.media || [],
    goalAmount: data.goalAmount || 100,
    raisedAmount: 0,
    creatorName: data.creatorName || 'Anonymous',
    creatorType: data.creatorType || 'individual',
    verificationStatus: data.verificationStatus || 'pending',
    submittedAt: Date.now(),
    isPublished: data.isPublished ?? true,
    orgName: data.orgName,
    giftTiers: data.giftTiers || [],
  };
  fundraisers.unshift(fundraiser);
  await AsyncStorage.setItem(KEY_FUNDRAISERS, JSON.stringify(fundraisers));
  return fundraiser;
}

async function getStoredFundraisers(): Promise<Fundraiser[]> {
  const raw = await AsyncStorage.getItem(KEY_FUNDRAISERS);
  return raw ? JSON.parse(raw) : [];
}

// ── Comments ───────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<DonationComment[]> {
  const raw = await AsyncStorage.getItem(KEY_COMMENTS);
  const allComments: DonationComment[] = raw ? JSON.parse(raw) : [];
  return allComments.filter((c) => c.postId === postId).sort((a, b) => b.timestamp - a.timestamp);
}

export async function getCommentsForFundraiser(fundId: string): Promise<DonationComment[]> {
  // First try direct match
  const direct = await getComments(fundId);
  if (direct.length > 0) return direct;

  // Fallback: find matching fundraiser in main store and get comments by title match
  const myFundraiser = await getMyFundraisers();
  const myF = myFundraiser.find((f) => f.id === fundId);
  if (!myF) return [];

  const allComments = await getAllComments();
  const mainFundraisers = await getStoredFundraisers();
  const mainF = mainFundraisers.find((f) => f.title === myF.title);
  if (mainF) {
    return allComments.filter((c) => c.postId === mainF.id).sort((a, b) => b.timestamp - a.timestamp);
  }

  return [];
}

export async function addComment(comment: DonationComment): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY_COMMENTS);
  const allComments: DonationComment[] = raw ? JSON.parse(raw) : [];
  allComments.push(comment);
  await AsyncStorage.setItem(KEY_COMMENTS, JSON.stringify(allComments));

  // Update raised amount in main fundraisers
  const fundraisers = await getStoredFundraisers();
  const idx = fundraisers.findIndex((f) => f.id === comment.postId);
  if (idx !== -1) {
    fundraisers[idx].raisedAmount += comment.amount;
    await AsyncStorage.setItem(KEY_FUNDRAISERS, JSON.stringify(fundraisers));
  }

  // Also update in my fundraisers so amounts stay in sync
  const myFundraisers = await getMyFundraisers();
  const myIdx = myFundraisers.findIndex((f) => f.id === comment.postId);
  if (myIdx !== -1) {
    myFundraisers[myIdx].raisedAmount += comment.amount;
    await AsyncStorage.setItem(KEY_MY_FUNDRAISERS, JSON.stringify(myFundraisers));
  }
}

// ── Donation History ───────────────────────────────────────────────────

const KEY_DONATION_HISTORY = '@pill_donation_history';

export async function getDonationHistory(): Promise<DonationRecord[]> {
  const raw = await AsyncStorage.getItem(KEY_DONATION_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function addDonationRecord(record: DonationRecord): Promise<void> {
  const history = await getDonationHistory();
  history.unshift(record);
  await AsyncStorage.setItem(KEY_DONATION_HISTORY, JSON.stringify(history));
}

export async function getAllComments(): Promise<DonationComment[]> {
  const raw = await AsyncStorage.getItem(KEY_COMMENTS);
  return raw ? JSON.parse(raw) : [];
}

// ── Verification ───────────────────────────────────────────────────────

export async function getVerificationStatus(): Promise<VerificationStatus | null> {
  const raw = await AsyncStorage.getItem(KEY_VERIFICATION);
  return raw ? JSON.parse(raw) : null;
}

export async function submitVerification(status: VerificationStatus): Promise<void> {
  await AsyncStorage.setItem(KEY_VERIFICATION, JSON.stringify(status));
}

// ── Onboarding ─────────────────────────────────────────────────────────

export async function isOnboarded(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY_ONBOARDED);
  return raw === 'true';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEY_ONBOARDED, 'true');
}

// ── Seed Data ──────────────────────────────────────────────────────────

async function seedDummyData(): Promise<Fundraiser[]> {
  const fundraisers: Fundraiser[] = [
    {
      id: 'seed-1',
      title: 'Mental Health Support Fund',
      description: 'Help us provide free mental health resources and crisis support to communities in need. Every dollar goes directly to training volunteers and expanding our hotline capacity.',
      imageUrl: '',
      media: [],
      goalAmount: 5000,
      raisedAmount: 2340,
      creatorName: 'Hope Foundation',
      creatorType: 'organization',
      verificationStatus: 'approved',
      submittedAt: Date.now() - 86400000 * 5,
      isPublished: true,
      orgName: 'Hope Foundation',
      giftTiers: [
        { id: 't1', minAmount: 5, title: 'Supporter Badge', description: 'Thank you card + digital badge', imageUrl: '' },
        { id: 't2', minAmount: 25, title: 'Friend of Hope', description: 'Exclusive wallpaper pack + badge', imageUrl: '' },
        { id: 't3', minAmount: 50, title: 'Champion', description: 'Handwritten thank you letter + all above', imageUrl: '' },
        { id: 't4', minAmount: 100, title: 'Legacy Builder', description: 'Name on our donor wall + all above', imageUrl: '' },
      ],
    },
    {
      id: 'seed-2',
      title: 'Community Listening Circle',
      description: 'Raising funds to create a safe space for weekly community listening circles where people can share their stories and find support.',
      imageUrl: '',
      media: [],
      goalAmount: 500,
      raisedAmount: 125,
      creatorName: 'Sarah M.',
      creatorType: 'individual',
      verificationStatus: 'approved',
      submittedAt: Date.now() - 86400000 * 2,
      isPublished: true,
      giftTiers: [
        { id: 't5', minAmount: 5, title: 'Listener', description: 'A warm thank you message', imageUrl: '' },
        { id: 't6', minAmount: 15, title: 'Circle Member', description: 'Access to exclusive group sessions', imageUrl: '' },
        { id: 't7', minAmount: 30, title: 'Heart of the Circle', description: 'Personalized gratitude video', imageUrl: '' },
      ],
    },
    {
      id: 'seed-3',
      title: 'Crisis Support Training Program',
      description: 'Supporting training for volunteer crisis counselors. We aim to train 50 new volunteers this year to expand our reach.',
      imageUrl: '',
      media: [],
      goalAmount: 10000,
      raisedAmount: 7800,
      creatorName: 'Safe Harbor Alliance',
      creatorType: 'organization',
      verificationStatus: 'approved',
      submittedAt: Date.now() - 86400000 * 10,
      isPublished: true,
      orgName: 'Safe Harbor Alliance',
      giftTiers: [
        { id: 't8', minAmount: 10, title: 'Trainee Sponsor', description: 'Certificate of contribution', imageUrl: '' },
        { id: 't9', minAmount: 50, title: 'Impact Maker', description: 'Progress report on trained volunteers', imageUrl: '' },
        { id: 't10', minAmount: 100, title: 'Alliance Partner', description: 'Invitation to annual appreciation event', imageUrl: '' },
      ],
    },
    {
      id: 'seed-4',
      title: 'Peer Support Meetup Fund',
      description: 'Organizing monthly peer support meetups for people dealing with anxiety and depression. Funds cover venue rental and refreshments.',
      imageUrl: '',
      media: [],
      goalAmount: 300,
      raisedAmount: 75,
      creatorName: 'Alex T.',
      creatorType: 'individual',
      verificationStatus: 'approved',
      submittedAt: Date.now() - 86400000 * 1,
      isPublished: true,
      giftTiers: [
        { id: 't11', minAmount: 5, title: 'Attendee', description: 'Free entry to any meetup', imageUrl: '' },
        { id: 't12', minAmount: 15, title: 'Regular', description: 'Meetup + refreshments covered', imageUrl: '' },
      ],
    },
  ];

  await AsyncStorage.setItem(KEY_FUNDRAISERS, JSON.stringify(fundraisers));

  // Seed comments
  const comments: DonationComment[] = [
    {
      id: 'c1',
      postId: 'seed-1',
      donorName: null,
      amount: 50,
      donationType: 'money',
      message: 'Thank you for this important work. Mental health matters.',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'c2',
      postId: 'seed-1',
      donorName: 'Jordan K.',
      amount: 1,
      donationType: 'ads',
      message: 'Watched an ad to contribute. Every little bit helps!',
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'c3',
      postId: 'seed-2',
      donorName: null,
      amount: 25,
      donationType: 'money',
      message: '',
      timestamp: Date.now() - 1800000,
    },
    {
      id: 'c4',
      postId: 'seed-3',
      donorName: 'Riley M.',
      amount: 100,
      donationType: 'money',
      message: 'Proud to support crisis training. You are doing amazing work.',
      timestamp: Date.now() - 86400000,
    },
  ];

  await AsyncStorage.setItem(KEY_COMMENTS, JSON.stringify(comments));

  return fundraisers;
}

// ── Fundraiser Account ────────────────────────────────────────────────

export async function getFundraiserAccount(): Promise<FundraiserAccount | null> {
  const raw = await AsyncStorage.getItem(KEY_ACCOUNT);
  return raw ? JSON.parse(raw) : null;
}

export async function createFundraiserAccount(data: Partial<FundraiserAccount> = {}): Promise<FundraiserAccount> {
  const account: FundraiserAccount = {
    type: null,
    email: '',
    emailVerified: false,
    phone: '',
    phoneVerified: false,
    nrcFrontUri: '',
    nrcBackUri: '',
    nrcSelfieUri: '',
    nrcVerified: false,
    orgCertificateUri: '',
    orgGroupPhoto1Uri: '',
    orgGroupPhoto2Uri: '',
    orgVerified: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };
  await AsyncStorage.setItem(KEY_ACCOUNT, JSON.stringify(account));
  return account;
}

export async function updateFundraiserAccount(data: Partial<FundraiserAccount>): Promise<FundraiserAccount | null> {
  const account = await getFundraiserAccount();
  if (!account) return null;
  const updated = { ...account, ...data, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY_ACCOUNT, JSON.stringify(updated));
  return updated;
}

export async function setEmailVerified(email: string, code: string): Promise<void> {
  const account = await getFundraiserAccount();
  if (account) {
    await updateFundraiserAccount({ email, emailVerified: true });
  } else {
    await createFundraiserAccount({ email, emailVerified: true });
  }
}

export async function setPhoneVerified(phone: string, phoneCode: string): Promise<void> {
  const account = await getFundraiserAccount();
  if (account) {
    await updateFundraiserAccount({ phone, phoneVerified: true });
  } else {
    await createFundraiserAccount({ phone, phoneVerified: true });
  }
}

export async function setNRCVerified(uris: { front: string; back: string; selfie: string }): Promise<void> {
  const account = await getFundraiserAccount();
  if (account) {
    await updateFundraiserAccount({
      nrcFrontUri: uris.front,
      nrcBackUri: uris.back,
      nrcSelfieUri: uris.selfie,
      nrcVerified: true,
    });
  }
}

export async function setOrgVerified(uris: { certificate: string; groupPhoto1: string; groupPhoto2: string }): Promise<void> {
  const account = await getFundraiserAccount();
  if (account) {
    await updateFundraiserAccount({
      orgCertificateUri: uris.certificate,
      orgGroupPhoto1Uri: uris.groupPhoto1,
      orgGroupPhoto2Uri: uris.groupPhoto2,
      orgVerified: true,
    });
  }
}

export function getNextVerificationStep(account: FundraiserAccount | null): string | null {
  if (!account) return 'EmailVerification';
  if (!account.emailVerified) return 'EmailVerification';
  if (!account.phoneVerified) return 'PhoneVerification';
  if (!account.nrcVerified) return 'NRCUpload';
  if (account.type === 'organization' && !account.orgVerified) return 'OrgDocumentsUpload';
  return null;
}

export function isFullyVerified(account: FundraiserAccount | null): boolean {
  if (!account) return false;
  return account.emailVerified && account.phoneVerified && account.nrcVerified;
}

// ── OTP Management ────────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateAndStoreEmailOTP(email: string): Promise<string> {
  const code = generateOTP();
  const record: OTPRecord = {
    email,
    code,
    phone: '',
    phoneCode: '',
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  await AsyncStorage.setItem(KEY_OTP, JSON.stringify(record));
  return code;
}

export async function generateAndStorePhoneOTP(phone: string): Promise<string> {
  const code = generateOTP();
  const raw = await AsyncStorage.getItem(KEY_OTP);
  const record: OTPRecord = raw ? JSON.parse(raw) : { email: '', code: '', phone: '', phoneCode: '', expiresAt: 0 };
  record.phone = phone;
  record.phoneCode = code;
  record.expiresAt = Date.now() + 5 * 60 * 1000;
  await AsyncStorage.setItem(KEY_OTP, JSON.stringify(record));
  return code;
}

export async function verifyEmailOTP(code: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY_OTP);
  if (!raw) return false;
  const record: OTPRecord = JSON.parse(raw);
  if (Date.now() > record.expiresAt) return false;
  return record.code === code;
}

export async function verifyPhoneOTP(code: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY_OTP);
  if (!raw) return false;
  const record: OTPRecord = JSON.parse(raw);
  if (Date.now() > record.expiresAt) return false;
  return record.phoneCode === code;
}

// ── My Fundraisers ────────────────────────────────────────────────────

export async function getMyFundraisers(): Promise<MyFundraiser[]> {
  const raw = await AsyncStorage.getItem(KEY_MY_FUNDRAISERS);
  return raw ? JSON.parse(raw) : [];
}

export async function addMyFundraiser(data: Partial<MyFundraiser>): Promise<MyFundraiser> {
  const fundraisers = await getMyFundraisers();
  const fundraiser: MyFundraiser = {
    id: data.id || `fundraiser-${Date.now()}`,
    title: data.title || 'Untitled Campaign',
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    media: data.media || [],
    goalAmount: data.goalAmount || 100,
    raisedAmount: data.raisedAmount || 0,
    donorCount: data.donorCount || 0,
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
    status: data.status || 'active',
  };
  fundraisers.unshift(fundraiser);
  await AsyncStorage.setItem(KEY_MY_FUNDRAISERS, JSON.stringify(fundraisers));
  return fundraiser;
}

export async function updateMyFundraiser(id: string, data: Partial<MyFundraiser>): Promise<MyFundraiser | null> {
  const fundraisers = await getMyFundraisers();
  const idx = fundraisers.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  fundraisers[idx] = { ...fundraisers[idx], ...data, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY_MY_FUNDRAISERS, JSON.stringify(fundraisers));
  return fundraisers[idx];
}

export async function deleteMyFundraiser(id: string): Promise<void> {
  const fundraisers = await getMyFundraisers();
  const filtered = fundraisers.filter((f) => f.id !== id);
  await AsyncStorage.setItem(KEY_MY_FUNDRAISERS, JSON.stringify(filtered));
}

// ── Comment Replies ───────────────────────────────────────────────────

export interface CommentReply {
  id: string;
  commentId: string;
  postId: string;
  reply: string;
  timestamp: number;
}

const KEY_REPLIES = '@pill_comment_replies';

export async function getReplies(commentId: string): Promise<CommentReply[]> {
  const raw = await AsyncStorage.getItem(KEY_REPLIES);
  const all: CommentReply[] = raw ? JSON.parse(raw) : [];
  return all.filter((r) => r.commentId === commentId);
}

export async function addReply(reply: CommentReply): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY_REPLIES);
  const all: CommentReply[] = raw ? JSON.parse(raw) : [];
  all.unshift(reply);
  await AsyncStorage.setItem(KEY_REPLIES, JSON.stringify(all));
}

export async function getCommentStats(postId: string): Promise<{ totalRaised: number; totalComments: number; totalReplies: number }> {
  const comments = await getComments(postId);
  let totalReplies = 0;
  for (const c of comments) {
    const replies = await getReplies(c.id);
    totalReplies += replies.length;
  }
  const totalRaised = comments.reduce((sum, c) => sum + c.amount, 0);
  return { totalRaised, totalComments: comments.length, totalReplies };
}

// ── Payout ─────────────────────────────────────────────────────────────

export interface PayoutRecord {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: number;
  completedAt?: number;
}

const KEY_PAYOUTS = '@pill_payouts';

export async function getPayouts(): Promise<PayoutRecord[]> {
  const raw = await AsyncStorage.getItem(KEY_PAYOUTS);
  return raw ? JSON.parse(raw) : [];
}

export async function requestPayout(amount: number): Promise<PayoutRecord> {
  const payouts = await getPayouts();
  const payout: PayoutRecord = {
    id: `payout-${Date.now()}`,
    amount,
    status: 'processing',
    requestedAt: Date.now(),
  };
  payouts.unshift(payout);
  await AsyncStorage.setItem(KEY_PAYOUTS, JSON.stringify(payouts));
  return payout;
}
