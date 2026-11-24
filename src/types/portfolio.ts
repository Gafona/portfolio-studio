export type RouteView = 'home' | 'cv' | 'studio';

export type PortfolioLayout = 'timeline' | 'timeline-alt' | 'minimal-grid';
export type FontPreset = 'modern' | 'editorial' | 'tech';
export type StylePreset = 'sky' | 'sky-pastel' | 'editorial' | 'minimal';
export type SkyBackdrop = 'cumulus' | 'pastel' | 'horizon' | 'none';
export type BorderRadiusScale = 'sharp' | 'balanced' | 'soft';
export type HeroLayout = 'split' | 'centered' | 'card';

export type HomeSectionKey =
  | 'highlights'
  | 'story'
  | 'timeline'
  | 'skills'
  | 'contact';

export type CvSectionKey =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'achievements';

export type CvTemplate = 'classic' | 'modern-split' | 'executive';
export type CvFontScale = 'sm' | 'md' | 'lg';
export type ThemeMode = 'light' | 'dark';

export type StudioSectionId =
  | 'profile'
  | 'experiences'
  | 'projects'
  | 'achievements'
  | 'eduSkills'
  | 'appearance'
  | 'stickers'
  | 'cv'
  | 'data';

export type BackgroundPosition = 'top' | 'center' | 'bottom';

export interface CustomBackgroundConfig {
  sameForBothModes: boolean;
  darkImageUrl: string;
  lightImageUrl: string;
  blur: number;
  overlayStrength: number;
  position: BackgroundPosition;
  fullPage: boolean;
}

export type StickerKind = 'builtin' | 'image' | 'badge' | 'emoji';
export type StickerAnimation = 'none' | 'float' | 'pulse' | 'wiggle' | 'spin-slow';
export type StickerLayer = 'front' | 'behind';

export interface CanvasSticker {
  id: string;
  kind: StickerKind;
  content: string;
  label?: string;
  bgColor?: string;
  textColor?: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  layer: StickerLayer;
  animation: StickerAnimation;
  hideOnMobile?: boolean;
}

export interface EditFocusTarget {
  section: StudioSectionId;
  itemId?: string;
  timestamp: number;
}

export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'website'
  | 'facebook'
  | 'behance'
  | 'dribbble'
  | 'x'
  | 'other';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  platform: SocialPlatform;
}

export interface HighlightMetric {
  id: string;
  label: string;
  value: string;
}

export interface ProfileInfo {
  fullName: string;
  monogram: string;
  role: string;
  tagline: string;
  avatarUrl: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  availability: string;
  showAvailability: boolean;
  aboutStory: string;
  cvSummary: string;
  highlights: HighlightMetric[];
  socials: SocialLink[];
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
  showInHome: boolean;
  showInCV: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  type: string;
  summary: string;
  bullets: string[];
  tags: string[];
  showInPortfolio: boolean;
  showInCV: boolean;
}

export interface ProjectCaseStudy {
  problem: string;
  solution: string;
  impact: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  period: string;
  role: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  shortDescription: string;
  cvSummary: string;
  caseStudy: ProjectCaseStudy;
  tags: string[];
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  showInPortfolio: boolean;
  showInCV: boolean;
}

export type AchievementCategory = 'award' | 'certificate' | 'milestone';

export interface AchievementItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: AchievementCategory;
  description: string;
  cvNote: string;
  imageUrl: string;
  credentialUrl: string;
  tags: string[];
  featured: boolean;
  showInPortfolio: boolean;
  showInCV: boolean;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  period: string;
  gpaOrHonors: string;
  details: string;
  showInHome: boolean;
  showInCV: boolean;
}

export interface HomeSectionsConfig {
  showHighlights: boolean;
  showStory: boolean;
  showFeatured?: boolean;
  showSkills: boolean;
  showTimelinePreview: boolean;
  showContact: boolean;
}

export interface CvSettingsConfig {
  template: CvTemplate;
  fontScale: CvFontScale;
  sectionOrder: CvSectionKey[];
  showAvatar: boolean;
  showSummary: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showAchievements: boolean;
  showEducation: boolean;
  showSkills: boolean;
  accentOnCV: boolean;
  compactMode: boolean;
}

export interface AppearanceConfig {
  stylePreset: StylePreset;
  skyBackdrop: SkyBackdrop;
  mode: ThemeMode;
  accentColor: string;
  fontPreset: FontPreset;
  borderRadius: BorderRadiusScale;
  heroLayout: HeroLayout;
  portfolioLayout: PortfolioLayout;
  homeSectionOrder: HomeSectionKey[];
  homeSections: HomeSectionsConfig;
  cvSettings: CvSettingsConfig;
  customBackground?: CustomBackgroundConfig;
  stickers?: CanvasSticker[];
}

export interface StudioAccessConfig {
  passwordHash: string;
}

export interface PortfolioData {
  version: number;
  updatedAt: string;
  profile: ProfileInfo;
  skills: SkillGroup[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  education: EducationItem[];
  appearance: AppearanceConfig;
  studioAccess?: StudioAccessConfig;
}
