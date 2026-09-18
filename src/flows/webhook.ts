import type { FieldValue, FlowConfig, FormField } from './types'
import { asText } from './validation'

export type WebhookPayload = {
  flowId: string
  flowName: string
  completedAt: string
  answers: Record<string, string | string[]>
  answersWithLabels: Array<{ fieldId: string; label: string; value: string | string[] }>
}

export function buildWebhookPayload(
  flow: FlowConfig,
  values: Record<string, FieldValue>,
  fieldsById: Map<string, FormField>,
): WebhookPayload {
  const answersWithLabels = Object.entries(values)
    .filter(([, value]) => asText(value).length > 0 || (Array.isArray(value) && value.length > 0))
    .map(([fieldId, value]) => ({
      fieldId,
      label: fieldsById.get(fieldId)?.label || fieldId,
      value,
    }))

  return {
    flowId: flow.id,
    flowName: flow.name,
    completedAt: new Date().toISOString(),
    answers: values,
    answersWithLabels,
  }
}

/** Manda o payload pro webhook configurado. Não trava a UI se falhar — quem
 * chama decide se quer aguardar (ex: "Testar webhook" mostra o resultado) ou
 * disparar e esquecer (conclusão real do fluxo). */
export async function sendWebhook(
  url: string,
  payload: unknown,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível confirmar o envio — pode ser CORS do seu servidor (serviços como Zapier, Make e n8n normalmente aceitam sem problema).',
    }
  }
}
