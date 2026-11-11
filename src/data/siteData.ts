export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Stack', href: '/stack' },
  { label: 'Journey', href: '/journey' },
  { label: 'Contact', href: '/contact' },
];

export const PERSONAL_INFO = {
  name: 'Sanchit Marwah',
  initials: 'SM.',
  role: 'Computer Science Student & Web Developer.',
  bio: 'Building web applications, exploring systems, and turning ideas into functional and meaningful products.',
  branch: 'CSE',
  batch: '2025 – 2029',
  email: 'Sanchitmarwah03@gmail.com',
  github: 'https://github.com/Sanchit0307',
  linkedin: 'https://www.linkedin.com/in/sanchit-marwah/',
  resumeUrl: '/resume.pdf',
} as const;

export interface Project {
  id: string;
  num: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
}

export const VERIFIED_PROJECTS: Project[] = [
  {
    id: 'delhi-ncr-complaint-portal',
    num: '01',
    title: 'Delhi NCR Complaint Portal',
    description: 'A web platform to register and track civic complaints across Delhi NCR.',
    tags: ['React', 'Node.js', 'Supabase'],
  },
  {
    id: 'kisan-setu',
    num: '02',
    title: 'Kisan Setu',
    description: 'A smart procurement-center management platform to reduce congestion for farmers.',
    tags: ['React', 'JavaScript', 'Firebase'],
    link: 'https://aryan689t.github.io/KisanSetu_V1/',
  },
];

export interface SkillCategory {
  category: string;
  items: {
    name: string;
    icon?: string;
  }[];
}

export const VERIFIED_SKILLS: SkillCategory[] = [
  {
    category: 'Frontend',
    items: [
      { name: 'HTML5' },
      { name: 'CSS3' },
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'Tailwind' },
    ],
  },
  {
    category: 'Backend & Services',
    items: [
      { name: 'Node.js' },
      { name: 'Supabase' },
      { name: 'Python' },
    ],
  },
  {
    category: 'Tools',
    items: [
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'VS Code' },
      { name: 'Figma' },
    ],
  },
];

export interface EducationItem {
  institution: string;
  degree?: string;
  period?: string;
  location?: string;
  tag?: string;
}

export const VERIFIED_EDUCATION: EducationItem[] = [
  {
    institution: 'SRM University, Sonepat',
    degree: 'B.Tech — Computer Science and Engineering',
    period: '2025 – 2029',
    tag: 'CSE',
  },
  {
    institution: 'Doon Public School',
    location: 'Paschim Vihar, New Delhi',
  },
];

