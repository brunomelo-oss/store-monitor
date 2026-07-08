import { jobService } from '../services'
import { getLogger } from '../lib/logger'

export async function runCleanup(daysToKeep: number = 90): Promise<void> {
  const logger = getLogger()
  logger.info({ daysToKeep }, 'Cleanup worker running...')

  const deleted = await jobService.cleanupOldJobs(daysToKeep)
  logger.info({ deleted, daysToKeep }, 'Cleanup complete')
}
