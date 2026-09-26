// Copy that differs between Gap Analysis (designs/06 Mvp*) and Implementation Support (07).
import type { SrCategory } from '@/mock';

export type ConsultingCategory = Extract<SrCategory, 'gap_analysis' | 'implementation_support'>;
export const CONSULTING_COPY: Record<ConsultingCategory, {
  title: string; description: string; listTitle: string; newLabel: string; wizardTitle: string; search: string;
  emptyTitle: string; emptyBody: string; step2: string; step2Sub: string; step1Sub: string;
  queueTitle: string; consDescription: string; periodLabel: string; approveFrom: string; approveTo: string; approvePlaceholder: string;
}> = {
  gap_analysis: {
    title: 'Gap Analysis', description: 'Find out how far you are from a framework before you commit to certification.', listTitle: 'My gap analyses',
    newLabel: 'Request a gap analysis', wizardTitle: 'New Gap Analysis', search: 'Search gap analyses',
    emptyTitle: 'No gap analyses yet', emptyBody: 'An SGS consultant compares your organisation with a framework and gives you a report of what is missing.',
    step1Sub: 'Pick one framework and the part of your organisation to assess.', step2: 'Details & submit', step2Sub: 'Help SGS plan the assessment.',
    queueTitle: 'Gap Analysis requests', consDescription: 'Gap analyses assigned to you. You can read the customer’s workspace until you complete the request.',
    periodLabel: 'On site', approveFrom: 'On site from', approveTo: 'On site to', approvePlaceholder: 'e.g. Please prepare access to the data centre on day 2.',
  },
  implementation_support: {
    title: 'Implementation Support', description: 'Work with an SGS consultant to close your gaps and get ready for certification.', listTitle: 'My support requests',
    newLabel: 'Request support', wizardTitle: 'New Implementation Support request', search: 'Search requests',
    emptyTitle: 'No support requests yet', emptyBody: 'An SGS consultant helps you put policies, controls and evidence in place for a framework.',
    step1Sub: 'Pick the framework you want to implement and the part of your organisation.', step2: 'Support & submit', step2Sub: 'Tell SGS what help you need.',
    queueTitle: 'Implementation Support requests', consDescription: 'Implementation Support assigned to you. Share deliverables as you go, then complete the request.',
    periodLabel: 'Period', approveFrom: 'Period from', approveTo: 'Period to', approvePlaceholder: 'e.g. Kick-off call in the first week of December.',
  },
};
