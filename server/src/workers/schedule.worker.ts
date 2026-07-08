import { jobRepository } from '../repositories'
import { getLogger } from '../lib/logger'

export async function startScheduleWorker(): Promise<void> {
  const logger = getLogger()
  logger.info('Schedule worker starting...')

  const poll = async () => {
    try {
      const jobs = await jobRepository.findScheduled()
      for (const job of jobs) {
        logger.info({ jobId: job.id, type: job.type }, 'Scheduled job picked up')
      }
    } catch (error) {
      logger.error({ err: error }, 'Schedule worker poll error')
    }
  }

  const interval = setInterval(poll, 10000)
  await poll()

  process.on('SIGTERM', () => {
    clearInterval(interval)
    logger.info('Schedule worker stopped')
    process.exit(0)
  })

  process.on('SIGINT', () => {
    clearInterval(interval)
    logger.info('Schedule worker stopped')
    process.exit(0)
  })
}
