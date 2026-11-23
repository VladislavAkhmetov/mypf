import type { Bi } from "./dombro";
import resumeJson from "./resume.json";

export interface ResumeJob {
  period: Bi;
  company: Bi;
  role: Bi;
  city?: Bi;
  bullets: Bi[];
}

export interface ResumeProjectItem {
  title: string;
  tagline: Bi;
  description: Bi;
  link?: string;
  linkLabel?: Bi;
}

export interface ResumeData {
  name: Bi;
  role: Bi;
  location: Bi;
  contacts: {
    telegram: { label: string; url: string; handle: string };
    email: { label: string; url: string; address: string };
    portfolio: { label: string; url: string; display: string };
  };
  summary: Bi;
  experience: ResumeJob[];
  projects: ResumeProjectItem[];
  skills: {
    specialization: Bi;
    tools: Bi;
    code?: Bi;
    ai: Bi;
  };
}

export const resumeData = resumeJson as ResumeData;
