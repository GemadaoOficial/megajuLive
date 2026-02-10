import { Router, Request, Response } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import { getConfig, setConfig, deleteConfig, getAllConfigs, loadConfig } from '../utils/config.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

router.use(authenticate, requireAdmin)

// GET /settings - list all configs (keys only, no values)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await getAllConfigs()
    res.json({ configs })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ message: 'Erro ao buscar configuracoes' })
  }
})

// GET /settings/:key - get masked value
router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const value = getConfig(req.params.key)
    if (value === undefined) {
      res.status(404).json({ message: 'Configuracao nao encontrada' })
      return
    }

    // Mask the value for security (show first 4 and last 4 chars)
    const masked =
      value.length > 10
        ? `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.slice(-4)}`
        : '****'

    res.json({ key: req.params.key, maskedValue: masked })
  } catch (error) {
    console.error('Get setting error:', error)
    res.status(500).json({ message: 'Erro ao buscar configuracao' })
  }
})

// PUT /settings/:key - create or update a config
router.put('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, encrypted = true, description } = req.body

    if (!value || !value.trim()) {
      res.status(400).json({ message: 'Valor e obrigatorio' })
      return
    }

    await setConfig(req.params.key, value.trim(), encrypted, description)

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'SYSTEM_CONFIG' as any,
      details: { key: req.params.key, encrypted },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Configuracao salva com sucesso' })
  } catch (error) {
    console.error('Set setting error:', error)
    res.status(500).json({ message: 'Erro ao salvar configuracao' })
  }
})

// DELETE /settings/:key - delete a config
router.delete('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteConfig(req.params.key)

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'SYSTEM_CONFIG' as any,
      details: { key: req.params.key },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Configuracao removida com sucesso' })
  } catch (error) {
    console.error('Delete setting error:', error)
    res.status(500).json({ message: 'Erro ao remover configuracao' })
  }
})

// POST /settings/migrate - migrate current env vars to encrypted DB
router.post('/migrate', async (req: Request, res: Response): Promise<void> => {
  try {
    const envKeys = [
      { key: 'JWT_SECRET', description: 'Chave secreta para tokens JWT' },
      { key: 'OPENAI_API_KEY', description: 'Chave da API OpenAI' },
    ]

    const migrated: string[] = []
    const skipped: string[] = []

    for (const { key, description } of envKeys) {
      const envValue = process.env[key]
      if (!envValue) {
        skipped.push(key)
        continue
      }

      // Check if already in DB
      const existing = getConfig(key)
      const isFromDb = existing !== undefined && existing !== envValue
      // If it's already in the DB with a different value, skip
      if (isFromDb) {
        skipped.push(key)
        continue
      }

      await setConfig(key, envValue, true, description)
      migrated.push(key)
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'SYSTEM_CONFIG' as any,
      details: { action: 'migrate', migrated, skipped },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({
      message: `${migrated.length} configuracoes migradas com sucesso`,
      migrated,
      skipped,
    })
  } catch (error) {
    console.error('Migrate settings error:', error)
    res.status(500).json({ message: 'Erro ao migrar configuracoes' })
  }
})

// POST /settings/reload - reload configs from DB
router.post('/reload', async (req: Request, res: Response): Promise<void> => {
  try {
    await loadConfig()
    res.json({ message: 'Configuracoes recarregadas com sucesso' })
  } catch (error) {
    console.error('Reload settings error:', error)
    res.status(500).json({ message: 'Erro ao recarregar configuracoes' })
  }
})

export default router
