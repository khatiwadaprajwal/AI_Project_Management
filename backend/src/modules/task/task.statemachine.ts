import { TaskStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
  IN_PROGRESS: ['READY_FOR_QA', 'BLOCKED', 'TODO', 'CANCELLED'],
  READY_FOR_QA: ['COMPLETED', 'REOPENED', 'BLOCKED'],
  COMPLETED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
  BLOCKED: ['TODO', 'IN_PROGRESS', 'CANCELLED'],
  CANCELLED: [],
};

const QA_ONLY_TRANSITIONS: Partial<Record<TaskStatus, TaskStatus[]>> = {
  READY_FOR_QA: ['COMPLETED', 'REOPENED'],
};

export const isValidTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
};

export const isQaOnlyTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return QA_ONLY_TRANSITIONS[from]?.includes(to) ?? false;
};

export const getAllowedNextStatuses = (from: TaskStatus): TaskStatus[] => {
  return ALLOWED_TRANSITIONS[from] ?? [];
};