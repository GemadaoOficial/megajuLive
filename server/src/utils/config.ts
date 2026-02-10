import prisma from './prisma.js'
import { encrypt, decrypt } from './crypto.js'

const configCache: Map<string, string> = new Map()
let loaded = false

export async function loadConfig(): Promise<void> {
  try {
    const configs = await prisma.systemConfig.findMany()
    configCache.clear()

    for (const config of configs) {
      try {
        const value = config.encrypted ? decrypt(config.value) : config.value
        configCache.set(config.key, value)
      } catch (error) {
        console.error(`Falha ao decriptar config "${config.key}":`, error)
      }
    }

    loaded = true
    console.log(`✅ ${configCache.size} configuracoes carregadas do banco de dados`)
  } catch (error) {
    console.error('Erro ao carregar configuracoes:', error)
  }
}

export function getConfig(key: string): string | undefined {
  // DB cache first, then fallback to process.env
  return configCache.get(key) ?? process.env[key]
}

export async function setConfig(
  key: string,
  value: string,
  encrypted: boolean = true,
  description?: string
): Promise<void> {
  const storedValue = encrypted ? encrypt(value) : value

  await prisma.systemConfig.upsert({
    where: { key },
    update: { value: storedValue, encrypted, ...(description !== undefined && { description }) },
    create: { key, value: storedValue, encrypted, description },
  })

  configCache.set(key, value)
}

export async function deleteConfig(key: string): Promise<void> {
  await prisma.systemConfig.delete({ where: { key } }).catch(() => {})
  configCache.delete(key)
}

export async function getAllConfigs(): Promise<
  Array<{ key: string; description: string | null; encrypted: boolean; updatedAt: Date }>
> {
  return prisma.systemConfig.findMany({
    select: { key: true, description: true, encrypted: true, updatedAt: true },
    orderBy: { key: 'asc' },
  })
}

export function isConfigLoaded(): boolean {
  return loaded
}
