/**
 * CONTENT & THEME: the only file you need to edit.
 * Copy, colours, flows, steps, options and form fields live here.
 */
import type { Flow, FlowId, Option } from './types';

/* Brand */
export const BRAND = {
  name: 'Nava Udyog',
  tagline: 'Connecting people, businesses and opportunities.',
  defaultEvent: 'nava_expo_2026',
  defaultSource: 'qr',
};

/* Colours: applied as CSS variables.
 * mode: 'light' (default) | 'dark' | 'system' (follows the device setting) */
export const THEME = {
  mode: 'light' as 'light' | 'dark' | 'system',
  light: {
    bg: '#FAFAF9',
    surface: '#FFFFFF',
    text: '#1C1917',
    muted: '#78716C',
    border: '#E7E5E4',
    accent: '#4F46E5',
    accentText: '#FFFFFF',
    accentSoft: '#EEF2FF',
    danger: '#E11D48',
  },
  dark: {
    bg: '#0C0A09',
    surface: '#1C1917',
    text: '#FAFAF9',
    muted: '#A8A29E',
    border: '#292524',
    accent: '#818CF8',
    accentText: '#0C0A09',
    accentSoft: '#1E1B4B',
    danger: '#FB7185',
  },
};

/* UI copy */
export const UI = {
  landingTitle: 'What are you looking for?',
  continue: 'Continue',
  back: 'Back',
  submit: 'Submit',
  submitting: 'Submitting…',
  edit: 'Edit',
  retry: 'Retry',
  home: 'Back to home',
  otherLabel: 'Please specify',
  selectHint: 'Select one or more',
  formConsent: 'I agree to be contacted by Nava Udyog. My information will be used only for this enquiry.',
  reviewConsent: 'I confirm the above information is accurate.',
  errorGeneric: "Couldn't send that. Please try again.",
  errorRateLimit: 'Please wait a moment before submitting again.',
  ref: 'Ref',
};

/* Landing options */
export const LANDING: (Option & { value: FlowId })[] = [
  { label: 'Looking for a Job', value: 'JOB_SEEKER' },
  { label: 'Looking for Employees', value: 'EMPLOYER' },
  { label: 'Looking for HR Services', value: 'HR_SERVICE' },
];
export const LANDING_DEFAULT: FlowId = 'EMPLOYER';

/* Helpers */
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Other'];
const opts = (...labels: string[]): Option[] => labels.map((l) => ({ label: l, value: l, other: l === 'Other' }));

/* FLOWS */
export const FLOWS: Record<FlowId, Flow> = {
  JOB_SEEKER: {
    code: 'JOB',
    success: { heading: "You're all set.", message: "We'll contact you shortly with relevant opportunities." },
    steps: [
      {
        id: 'experience', type: 'wheel', label: 'Experience',
        title: 'What is your current experience?',
        subtitle: 'Select the option that best describes you.',
        defaultValue: '2-5 Years',
        options: opts('Fresher', '1-2 Years', '2-5 Years', '5-10 Years', '10+ Years'),
      },
      {
        id: 'field', type: 'wheel', label: 'Field',
        title: 'Which field are you looking for?',
        subtitle: 'Select the field that matches your skills.',
        defaultValue: 'Business / Operations',
        otherPlaceholder: 'Your field',
        options: opts('IT / Software', 'Business / Operations', 'Sales & Marketing', 'Finance & Accounts',
          'HR / Administration', 'Engineering', 'Design', 'Customer Support', 'Other'),
      },
      {
        id: 'preferences', type: 'chips', label: 'Job Type',
        title: 'What type of job do you prefer?',
        groups: [
          { id: 'employmentType', title: 'Employment Type', multi: true, options: ['Full-time', 'Part-time', 'Internship', 'Freelance / Contract'] },
          { id: 'workMode', title: 'Work Mode', multi: true, options: ['Remote', 'Work from Office', 'Hybrid'] },
        ],
      },
      {
        id: 'details', type: 'form', label: 'Details',
        title: 'Tell us about yourself',
        fields: [
          { id: 'fullName', label: 'Full Name', placeholder: 'Your full name', type: 'text', required: true, rule: 'name' },
          { id: 'mobile', label: 'Mobile Number', placeholder: '98765 43210', type: 'tel', required: true, rule: 'mobile' },
          { id: 'email', label: 'Email', placeholder: 'name@example.com', type: 'email', required: true, rule: 'email' },
          { id: 'currentLocation', label: 'Current Location', placeholder: 'Select', type: 'select', options: CITIES },
          { id: 'qualification', label: 'Highest Qualification', placeholder: 'Select', type: 'select',
            options: ['B.Tech / B.E.', 'BCA / MCA', 'B.Sc / M.Sc', 'B.Com / M.Com', 'BBA / MBA', 'Diploma', 'Any Graduate', 'Post Graduate', 'Other'] },
          { id: 'preferredLocation', label: 'Preferred Location', placeholder: 'Select', type: 'select',
            options: [...CITIES.slice(0, 6), 'Remote / Anywhere', 'Other'] },
        ],
      },
      { id: 'review', type: 'review', label: 'Review', title: 'Review your details' },
    ],
  },
  EMPLOYER: {
    code: 'EMP',
    success: { heading: "You're all set.", message: 'Our hiring team will connect with you within 24 hours.' },
    steps: [
      {
        id: 'role', type: 'wheel', label: 'Role',
        title: 'What role are you hiring for?',
        defaultValue: 'IT / Software Engineers',
        otherPlaceholder: 'Required role',
        options: opts('IT / Software Engineers', 'Business & Operations', 'Sales & Business Dev', 'Finance & Accounts',
          'HR & Talent', 'Mechanical & Civil Engineers', 'Customer Support & BPO', 'Other'),
      },
      {
        id: 'experienceRequired', type: 'wheel', label: 'Experience',
        title: 'What experience level is required?',
        defaultValue: '2-5 Years',
        options: [
          { label: 'Fresher (0-1 Year)', value: '0-1 Year' },
          { label: 'Junior (1-2 Years)', value: '1-2 Years' },
          { label: 'Mid-level (2-5 Years)', value: '2-5 Years' },
          { label: 'Senior (5-8 Years)', value: '5-8 Years' },
          { label: 'Lead (8+ Years)', value: '8+ Years' },
        ],
      },
      {
        id: 'hiringType', type: 'chips', label: 'Hiring Type',
        title: 'What hiring arrangement fits best?',
        groups: [
          { id: 'hiringModel', title: 'Hiring Model', multi: true, options: ['Full-time Permanent', 'Contract / C2H', 'Internship', 'Immediate Joining'] },
          { id: 'workArrangement', title: 'Work Arrangement', multi: true, options: ['On-site', 'Hybrid', 'Remote'] },
        ],
      },
      {
        id: 'hiringLocation', type: 'wheel', label: 'Location',
        title: 'Where is this role located?',
        defaultValue: 'Bengaluru',
        otherPlaceholder: 'City',
        options: [...opts('Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'),
          { label: 'Pan-India Remote', value: 'Remote' }, { label: 'Other', value: 'Other', other: true }],
      },
      {
        id: 'company', type: 'form', label: 'Contact',
        title: 'Company & contact details',
        fields: [
          { id: 'companyName', label: 'Company Name', placeholder: 'Company', type: 'text', required: true, rule: 'text' },
          { id: 'openings', label: 'Number of Openings', placeholder: 'Select', type: 'select', options: ['1-2', '3-5', '6-15', '15+'] },
          { id: 'contactPerson', label: 'Contact Person', placeholder: 'Full name', type: 'text', required: true, rule: 'name' },
          { id: 'mobile', label: 'Mobile Number', placeholder: '98765 43210', type: 'tel', required: true, rule: 'mobile' },
          { id: 'email', label: 'Work Email', placeholder: 'you@company.com', type: 'email', required: true, rule: 'email', wide: true },
        ],
      },
      { id: 'review', type: 'review', label: 'Review', title: 'Review your requirement' },
    ],
  },
  HR_SERVICE: {
    code: 'HRS',
    success: { heading: "You're all set.", message: 'Our HR experts will contact you with a tailored proposal.' },
    steps: [
      {
        id: 'service', type: 'wheel', label: 'Service',
        title: 'Which HR service do you need?',
        defaultValue: 'Staffing & Recruitment',
        otherPlaceholder: 'HR service',
        options: opts('Staffing & Recruitment', 'Payroll Management', 'Compliance & Labour Law', 'Corporate Training',
          'Background Verification', 'End-to-End HR Operations', 'Other'),
      },
      {
        id: 'scope', type: 'chips', label: 'Scope',
        title: 'Select your scope',
        groups: [
          { id: 'priorityScope', title: 'Priority Scope', multi: true,
            options: ['Immediate Staffing', 'Payroll Outsourcing', 'Statutory Compliance', 'Employee Onboarding', 'Enterprise Retainer'] },
          { id: 'teamSize', title: 'Organisation Size', options: ['1-20', '21-100', '101-500', '500+'] },
        ],
      },
      {
        id: 'timeline', type: 'wheel', label: 'Timeline',
        title: 'What is your rollout timeline?',
        defaultValue: 'Within 1 Month',
        options: opts('Immediate (< 1 Week)', 'Within 1 Month', '1-3 Months', 'Exploring Options'),
      },
      {
        id: 'contact', type: 'form', label: 'Contact',
        title: 'Organisation & contact details',
        fields: [
          { id: 'companyName', label: 'Organisation Name', placeholder: 'Organisation', type: 'text', required: true, rule: 'text' },
          { id: 'contactPerson', label: 'Contact Person', placeholder: 'Full name', type: 'text', required: true, rule: 'name' },
          { id: 'mobile', label: 'Mobile Number', placeholder: '98765 43210', type: 'tel', required: true, rule: 'mobile' },
          { id: 'email', label: 'Business Email', placeholder: 'you@company.com', type: 'email', required: true, rule: 'email' },
        ],
      },
      { id: 'review', type: 'review', label: 'Review', title: 'Review your request' },
    ],
  },
};
