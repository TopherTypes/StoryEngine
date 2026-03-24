import type { Story, ValidationError } from '../types'

export function validateStory(story: Story): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check: All artefact IDs are unique
  const ids = new Set<string>()
  story.artefacts.forEach((a) => {
    if (ids.has(a.id)) {
      errors.push({
        level: 'error',
        code: 'duplicate_id',
        message: `Duplicate artefact ID: ${a.id}`,
        artefactId: a.id,
      })
    }
    ids.add(a.id)
  })

  // Check: Locked items have passwords
  story.artefacts.forEach((a) => {
    if (a.locked && !a.lockPassword) {
      errors.push({
        level: 'error',
        code: 'missing_password',
        message: `Locked artefact "${a.title}" has no password`,
        artefactId: a.id,
      })
    }
  })

  // Check: Image/Audio artefacts have assetId
  story.artefacts.forEach((a) => {
    if ((a.type === 'image' || a.type === 'audio') && !a.assetId) {
      errors.push({
        level: 'error',
        code: 'missing_asset',
        message: `${a.type === 'image' ? 'Image' : 'Audio'} artefact "${a.title}" has no asset`,
        artefactId: a.id,
      })
    }
  })

  // Check: Email threads have ≥1 message
  const emailThreads = new Map<string, number>()
  story.artefacts.forEach((a) => {
    if (a.type === 'email') {
      const threadId = (a as any).threadId
      emailThreads.set(threadId, (emailThreads.get(threadId) || 0) + 1)
    }
  })
  emailThreads.forEach((count, threadId) => {
    if (count === 0) {
      warnings.push({
        level: 'warning',
        code: 'empty_thread',
        message: `Email thread "${threadId}" has no messages`,
      })
    }
  })

  // Check: IM conversations have ≥1 message
  const imConversations = new Map<string, number>()
  story.artefacts.forEach((a) => {
    if (a.type === 'im') {
      const conversationId = (a as any).conversationId
      imConversations.set(conversationId, (imConversations.get(conversationId) || 0) + 1)
    }
  })
  imConversations.forEach((count, conversationId) => {
    if (count === 0) {
      warnings.push({
        level: 'warning',
        code: 'empty_conversation',
        message: `IM conversation "${conversationId}" has no messages`,
      })
    }
  })

  // Check: No self-referencing rules
  story.artefacts.forEach((a) => {
    if (a.releaseTriggers) {
      a.releaseTriggers.forEach((rule: any) => {
        if (
          (rule.type === 'artefact_opened' || rule.type === 'artefact_read') &&
          rule.artefactId === a.id
        ) {
          warnings.push({
            level: 'warning',
            code: 'self_reference',
            message: `Artefact "${a.title}" references itself in release rule`,
            artefactId: a.id,
          })
        }
      })
    }
  })

  // Check: Referenced artefacts exist
  const artefactIds = new Set(story.artefacts.map((a) => a.id))
  story.artefacts.forEach((a) => {
    if (a.releaseTriggers) {
      a.releaseTriggers.forEach((rule: any) => {
        if (
          (rule.type === 'artefact_opened' || rule.type === 'artefact_read') &&
          !artefactIds.has(rule.artefactId)
        ) {
          errors.push({
            level: 'error',
            code: 'missing_reference',
            message: `Release rule references non-existent artefact: ${rule.artefactId}`,
            artefactId: a.id,
          })
        }
      })
    }
  })

  // Check: Ending trigger conditions reference existing artefacts
  if (story.ending && story.ending.triggerConditions) {
    story.ending.triggerConditions.forEach((rule: any) => {
      if (
        rule.type &&
        (rule.type === 'artefact_opened' || rule.type === 'artefact_read') &&
        !artefactIds.has(rule.artefactId)
      ) {
        warnings.push({
          level: 'warning',
          code: 'missing_reference',
          message: `Ending trigger references non-existent artefact: ${rule.artefactId}`,
        })
      }
    })
  }

  // Check: Story has metadata
  if (!story.title) {
    warnings.push({
      level: 'warning',
      code: 'missing_metadata',
      message: 'Story has no title',
    })
  }

  return { errors, warnings }
}
