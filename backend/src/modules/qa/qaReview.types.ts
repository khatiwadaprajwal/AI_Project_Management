import { z } from 'zod';
import { createQaReviewSchema } from './qaReview.validation';

export type CreateQaReviewInput = z.infer<typeof createQaReviewSchema>['body'];
