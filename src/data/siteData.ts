export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Stack', href: '/stack' },
  { label: 'Dashboard', href: '/github' },
  { label: 'Journey', href: '/achievements' },
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
  githubUsername: 'Sanchit0307',
  linkedin: 'https://www.linkedin.com/in/sanchit-marwah/',
  resumeUrl: '/resume.pdf',
} as const;

export interface Project {
  id: string;
  num: string;
  title: string;
  type?: 'Individual' | 'Collaborative';
  role?: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  image: string;
  featured?: boolean;
}

export const VERIFIED_PROJECTS: Project[] = [
  {
    id: 'delhi-ncr-complaint-portal',
    num: '01',
    title: 'Delhi NCR Complaint Portal',
    type: 'Individual',
    description: 'An AI-powered citizen grievance redressal platform enabling residents across Delhi NCR to draft legally sound formal representations routed directly to concerned authorities.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Google Gemini'],
    link: 'https://delhi-complaint-portal-fduhfggb8-sanchit0307s-projects.vercel.app/',
    github: 'https://github.com/Sanchit0307/delhi-complaint-portal',
    image: '/images/projects/delhi-complaint-portal.png',
    featured: true,
  },
  {
    id: 'campusvoice',
    num: '02',
    title: 'CampusVoice',
    type: 'Individual',
    description: 'A student ideas and suggestions platform empowering campus communities to propose initiatives, discover suggestions, and track ideas through their review and implementation lifecycle.',
    tags: ['React', 'JavaScript', 'Firebase', 'Tailwind CSS'],
    link: 'https://sanchit0307-campusvoice.vercel.app/',
    github: 'https://github.com/Sanchit0307/campus-ideas-portal',
    image: '/images/projects/campusvoice.png',
    featured: true,
  },
  {
    id: 'annagati',
    num: '03',
    title: 'Annagati',
    type: 'Collaborative',
    role: 'Frontend Development & Authorization',
    description: 'A smart crop procurement and mandi queue management platform to reduce congestion for farmers with digital token issuing, slot booking, and MSP workflow tracking.',
    tags: ['React', 'JavaScript', 'Firebase', 'Tailwind CSS'],
    link: 'https://kisaan-setu-v3.vercel.app/',
    image: '/images/projects/annagati.png',
    featured: true,
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
      { name: 'Tailwind CSS' },
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

export interface EducationMilestone {
  stage: string;
  period?: string;
  status: 'Ongoing' | 'Completed';
  institution?: string;
  board?: string;
  degree?: string;
  location?: string;
  description: string;
  tag?: string;
}

export const VERIFIED_EDUCATION: EducationMilestone[] = [
  {
    stage: 'Undergraduate Education',
    period: '2025 – 2029',
    status: 'Ongoing',
    institution: 'SRM University, Sonepat',
    degree: 'B.Tech — Computer Science and Engineering',
    tag: 'CSE',
    description: 'Currently pursuing undergraduate studies in computer science, developing foundations in programming, software development and computer science concepts.',
  },
  {
    stage: 'Class 12 — CBSE',
    status: 'Completed',
    board: 'Central Board of Secondary Education (CBSE)',
    tag: 'Senior Secondary',
    description: 'Completed senior secondary education, building the academic foundation for undergraduate studies.',
  },
  {
    stage: 'Class 10 — CBSE',
    status: 'Completed',
    institution: 'Doon Public School',
    location: 'Paschim Vihar, New Delhi',
    tag: 'Secondary',
    description: 'Completed secondary education under the CBSE curriculum.',
  },
];
