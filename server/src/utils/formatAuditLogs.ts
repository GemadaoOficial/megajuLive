/**
 * Shared audit log formatter - extracted from admin.ts (fix #8: duplicate code)
 */

interface AuditLogWithUser {
    id: string
    action: string
    entity: string
    details: string | null
    createdAt: Date
    user?: { name: string } | null
}

interface FormattedActivity {
    id: string
    text: string
    time: string
    type: string
}

export function formatAuditLogs(logs: AuditLogWithUser[]): FormattedActivity[] {
    const actionMap: Record<string, string> = {
        CREATE: 'Criou', UPDATE: 'Atualizou', DELETE: 'Excluiu',
        LOGIN: 'Login', LOGOUT: 'Logout', START_LIVE: 'Iniciou live', END_LIVE: 'Encerrou live',
    }
    const entityMap: Record<string, string> = {
        USER: 'usuario', LIVE: 'live', PRODUCT: 'produto', AUTH: 'autenticacao',
    }

    return logs.map(log => {
        let details: any = {}
        try { if (log.details) details = JSON.parse(log.details) } catch { /* corrupted JSON */ }

        const action = actionMap[log.action] || log.action
        const entity = entityMap[log.entity] || log.entity
        const title = details.title || details.name || ''

        const diff = Date.now() - new Date(log.createdAt).getTime()
        let time = ''
        if (diff < 60000) time = 'agora'
        else if (diff < 3600000) time = `${Math.floor(diff / 60000)} min atras`
        else if (diff < 86400000) time = `${Math.floor(diff / 3600000)}h atras`
        else time = new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

        return {
            id: log.id,
            text: `${log.user?.name || 'Sistema'}: ${action} ${entity}${title ? ': ' + title : ''}`,
            time,
            type: log.entity === 'USER' || log.entity === 'AUTH' ? 'user' : log.entity === 'LIVE' ? 'live' : 'tutorial',
        }
    })
}
