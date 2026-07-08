import { loadEnv } from '../lib/env'
import { createLogger, getLogger } from '../lib/logger'

loadEnv()
createLogger()
const logger = getLogger()

const command = process.argv[2]

async function main() {
  switch (command) {
    case 'sync': {
      const { startSyncWorker } = await import('./sync.worker')
      await startSyncWorker()
      break
    }
    case 'schedule': {
      const { startScheduleWorker } = await import('./schedule.worker')
      await startScheduleWorker()
      break
    }
    case 'cleanup': {
      const { runCleanup } = await import('./cleanup.worker')
      await runCleanup()
      break
    }
    default: {
      logger.error({ command }, 'Unknown worker command. Use: sync | schedule | cleanup')
      process.exit(1)
    }
  }
}

main().catch((err) => {
  logger.error({ err }, 'Worker failed')
  process.exit(1)
})
