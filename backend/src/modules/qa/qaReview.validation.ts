import { z } from 'zod';
export { taskIdParamsSchema } from '../../utils/commonParams.schema';

export const createQaReviewSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({
    result: z.enum(['PASS', 'FAIL']),
    note: z.string().optional(),
  }),
});
