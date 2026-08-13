import { config } from './config/env'
import { buildApp } from './app'

async function bootstrap() {
  const app = buildApp()
  await app.listen({ host: config.host, port: config.port })
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
