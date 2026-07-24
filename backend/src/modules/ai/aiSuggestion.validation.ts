import { z } from 'zod';
export { featureIdParamsSchema, taskIdParamsSchema } from '../../utils/commonParams.schema';

export const suggestionIdParamsSchema = z.object({
  params: z.object({ suggestionId: z.string().min(1) }),
});
