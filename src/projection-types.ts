// projection-types.ts — lab 服务状态的 projection schema
import { z } from 'zod'
import type {} from './context-augment.js'

export const LabStateSchema = z.object({
  active: z.boolean(),
})

export type LabState = z.infer<typeof LabStateSchema>
