export type FlowId = 'JOB_SEEKER' | 'EMPLOYER' | 'HR_SERVICE';

export type Answers = Record<string, string | string[]>;

export interface Option {
  label: string;
  value: string;
  /** Selecting this option reveals a free-text input. */
  other?: boolean;
}

export interface ChipGroup {
  id: string;
  title: string;
  multi?: boolean;
  options: string[];
}

export interface Field {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel' | 'email' | 'select';
  required?: boolean;
  rule?: 'name' | 'mobile' | 'email' | 'text';
  options?: string[];
  /** Span both columns on wider screens. */
  wide?: boolean;
}

interface StepBase {
  id: string;
  title: string;
  subtitle?: string;
  /** Short label used in the progress bar and review screen. */
  label: string;
}

export type Step = StepBase &
  (
    | { type: 'wheel'; options: Option[]; defaultValue?: string; otherPlaceholder?: string }
    | { type: 'chips'; groups: ChipGroup[] }
    | { type: 'form'; fields: Field[] }
    | { type: 'review' }
  );

export interface Flow {
  /** 3-letter code used in the lead reference, e.g. NU-JOB-XXXXXXXX */
  code: string;
  success: { heading: string; message: string };
  steps: Step[];
}

export interface LeadState {
  flowId: FlowId | null;
  step: number;
  answers: Answers;
  other: Record<string, string>;
  consent: boolean;
  ref: string | null;
  done: boolean;
}
