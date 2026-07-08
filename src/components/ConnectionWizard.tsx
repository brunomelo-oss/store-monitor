'use client'

import { useState } from 'react'
import { Globe, Apple, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface GoogleCredentials {
  clientEmail: string
  privateKey: string
}

interface AppleCredentials {
  issuerId: string
  keyId: string
  privateKey: string
}

type Credentials = GoogleCredentials | AppleCredentials

interface ConnectionWizardProps {
  store: 'GOOGLE' | 'APPLE'
  onClose: () => void
  onSubmit: (label: string, credentials: Record<string, unknown>) => Promise<void>
  initialLabel?: string
  initialCredentials?: Record<string, unknown>
}

export function ConnectionWizard({ store, onClose, onSubmit, initialLabel, initialCredentials }: ConnectionWizardProps) {
  const [step, setStep] = useState<'form' | 'test'>('form')
  const [label, setLabel] = useState(initialLabel || '')
  const [creds, setCreds] = useState<Credentials>(() => {
    if (store === 'GOOGLE') {
      return {
        clientEmail: (initialCredentials?.clientEmail as string) || '',
        privateKey: (initialCredentials?.privateKey as string) || '',
      }
    }
    return {
      issuerId: (initialCredentials?.issuerId as string) || '',
      keyId: (initialCredentials?.keyId as string) || '',
      privateKey: (initialCredentials?.privateKey as string) || '',
    }
  })
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<{ valid: boolean; message?: string } | null>(null)
  const [testing, setTesting] = useState(false)

  const isGoogle = store === 'GOOGLE'
  const googleCreds = creds as GoogleCredentials
  const appleCreds = creds as AppleCredentials

  const isFormValid = isGoogle
    ? googleCreds.clientEmail.length > 0 && googleCreds.privateKey.length > 0 && label.length > 0
    : appleCreds.issuerId.length > 0 && appleCreds.keyId.length > 0 && appleCreds.privateKey.length > 0 && label.length > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const credentials = isGoogle
        ? { clientEmail: googleCreds.clientEmail, privateKey: googleCreds.privateKey }
        : { issuerId: appleCreds.issuerId, keyId: appleCreds.keyId, privateKey: appleCreds.privateKey }
      await onSubmit(label, credentials)
      onClose()
    } catch {
      // error handled by caller
    } finally {
      setSubmitting(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const credentials = isGoogle
        ? { clientEmail: googleCreds.clientEmail, privateKey: googleCreds.privateKey }
        : { issuerId: appleCreds.issuerId, keyId: appleCreds.keyId, privateKey: appleCreds.privateKey }
      // Create the connection first if it doesn't exist, then test
      // For testing before saving, we'd need a test-only endpoint
      // For now, let's just validate the form data format
      if (isGoogle) {
        if (!googleCreds.clientEmail.includes('@')) {
          setTestResult({ valid: false, message: 'Email de cliente inválido' })
          return
        }
        if (!googleCreds.privateKey.includes('BEGIN PRIVATE KEY')) {
          setTestResult({ valid: false, message: 'Chave privada inválida (deve começar com -----BEGIN PRIVATE KEY-----)' })
          return
        }
      } else {
        if (appleCreds.issuerId.length < 10) {
          setTestResult({ valid: false, message: 'Issuer ID parece inválido' })
          return
        }
        if (appleCreds.keyId.length < 5) {
          setTestResult({ valid: false, message: 'Key ID parece inválido' })
          return
        }
      }
      setTestResult({ valid: true, message: 'Formato das credenciais válido. Salve e teste a conexão após criar.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div className="relative w-full max-w-lg bg-card border rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isGoogle ? 'bg-green-500/10' : 'bg-zinc-500/10'}`}>
            {isGoogle ? <Globe size={20} className="text-green-500" /> : <Apple size={20} className="text-zinc-400" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{isGoogle ? 'Google Play' : 'App Store Connect'}</h2>
            <p className="text-sm text-muted-foreground">{isGoogle ? 'Conectar ao Google Play Console' : 'Conectar ao App Store Connect'}</p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Conexão</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={isGoogle ? 'Google Play Produção' : 'Apple Store Produção'}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors"
            />
          </div>

          {isGoogle ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Client Email (Service Account)</label>
                <input
                  value={googleCreds.clientEmail}
                  onChange={e => setCreds({ ...googleCreds, clientEmail: e.target.value })}
                  placeholder="monitor@project.iam.gserviceaccount.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Private Key</label>
                <div className="relative">
                  <input
                    value={googleCreds.privateKey}
                    onChange={e => setCreds({ ...googleCreds, privateKey: e.target.value })}
                    placeholder="-----BEGIN PRIVATE KEY-----..."
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors font-mono"
                    type={showKey ? 'text' : 'password'}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 text-muted-foreground"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Issuer ID</label>
                <input
                  value={appleCreds.issuerId}
                  onChange={e => setCreds({ ...appleCreds, issuerId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key ID</label>
                <input
                  value={appleCreds.keyId}
                  onChange={e => setCreds({ ...appleCreds, keyId: e.target.value })}
                  placeholder="XXXXXXXXXX"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Private Key (Auth Key)</label>
                <div className="relative">
                  <input
                    value={appleCreds.privateKey}
                    onChange={e => setCreds({ ...appleCreds, privateKey: e.target.value })}
                    placeholder="-----BEGIN PRIVATE KEY-----..."
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent outline-none focus:border-foreground/30 transition-colors font-mono"
                    type={showSecret ? 'text' : 'password'}
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 text-muted-foreground"
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              testResult.valid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {testResult.valid ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors">
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={!isFormValid || testing}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : 'Validar'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : (initialLabel ? 'Atualizar' : 'Criar Conexão')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
