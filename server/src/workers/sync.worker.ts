import { PollingDispatcher } from '../jobs/polling-dispatcher'
import { getLogger } from '../lib/logger'

export async function startSyncWorker(): Promise<void> {
  const logger = getLogger()
  logger.info('Sync worker starting...')

  const dispatcher = new PollingDispatcher(5000)
  dispatcher.start()

  process.on('SIGTERM', () => {
    logger.info('Sync worker shutting down...')
    dispatcher.stop()
    process.exit(0)
  })

  process.on('SIGINT', () => {
    logger.info('Sync worker shutting down...')
    dispatcher.stop()
    process.exit(0)
  })
}
