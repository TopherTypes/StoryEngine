/**
 * Zod validation schemas for all StoryEngine types
 * These schemas validate data at runtime and provide type inference
 */
import { z } from 'zod';
// ==================== RELEASE RULES ====================
export const TimeRuleSchema = z.object({
    type: z.literal('time'),
    minutes: z.number().min(0),
});
export const ArtefactRuleSchema = z.object({
    type: z.enum(['artefact_opened', 'artefact_read']),
    artefactId: z.string().min(1),
});
export const PasswordRuleSchema = z.object({
    type: z.literal('password'),
    passwordKey: z.string().min(1),
});
export const AppRuleSchema = z.object({
    type: z.enum(['app_opened', 'folder_opened']),
    appName: z.string().min(1),
});
export const ConditionGroupSchema = z.object({
    type: z.literal('condition_group'),
    operator: z.enum(['AND', 'OR']),
    rules: z.lazy(() => z.array(ReleaseRuleSchema)),
});
export const ReleaseRuleSchema = z.union([
    TimeRuleSchema,
    ArtefactRuleSchema,
    PasswordRuleSchema,
    AppRuleSchema,
    ConditionGroupSchema,
]);
// ==================== ARTEFACTS ====================
export const BaseArtefactSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    visibleTitle: z.string().optional(),
    type: z.enum(['email', 'im', 'calendar', 'document', 'image', 'audio']),
    releaseAtTime: z.number().min(0).optional(),
    releaseTriggers: z.array(ReleaseRuleSchema).optional(),
    locked: z.boolean(),
    lockPassword: z.string().optional(),
    lockHint: z.string().optional(),
    readOnly: z.boolean().optional(),
    hidden: z.boolean().optional(),
    tags: z.array(z.string()),
    created: z.number(),
    modified: z.number(),
    notes: z.string().optional(),
});
export const EmailArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('email'),
    sender: z.string().min(1),
    recipients: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    threadId: z.string().min(1),
    timestamp: z.string().optional(),
    hasAttachment: z.boolean(),
    attachments: z.array(z.string()).optional(),
});
export const IMArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('im'),
    conversationId: z.string().min(1),
    senderId: z.string().min(1),
    body: z.string(),
    displayOrder: z.number().min(0),
    timestamp: z.string().optional(),
    hasAttachment: z.boolean(),
    attachments: z.array(z.string()).optional(),
});
export const CalendarArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('calendar'),
    eventTitle: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().optional(),
    description: z.string(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    recurring: z.string().optional(),
});
export const DocumentArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('document'),
    body: z.string(),
    assetId: z.string().optional(),
    folderPath: z.string(),
});
export const ImageArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('image'),
    assetId: z.string().min(1),
    caption: z.string().optional(),
    folderPath: z.string(),
});
export const AudioArtefactSchema = BaseArtefactSchema.extend({
    type: z.literal('audio'),
    assetId: z.string().min(1),
    title: z.string(),
    duration: z.number().optional(),
    folderPath: z.string(),
});
export const ArtefactSchema = z.union([
    EmailArtefactSchema,
    IMArtefactSchema,
    CalendarArtefactSchema,
    DocumentArtefactSchema,
    ImageArtefactSchema,
    AudioArtefactSchema,
]);
// ==================== CONFIGURATION ====================
export const ThemeConfigSchema = z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    fontFamily: z.string(),
    fontSize: z.object({
        small: z.number(),
        normal: z.number(),
        large: z.number(),
    }),
    wallpaperUrl: z.string().optional(),
    taskbarPosition: z.enum(['top', 'bottom', 'left', 'right']),
    desktopIconSize: z.number(),
    osName: z.string(),
    appIcon: z.string().optional(),
});
export const LoginConfigSchema = z.object({
    enabled: z.boolean(),
    username: z.string(),
    password: z.string(),
    message: z.string().optional(),
    requireCredentials: z.boolean(),
});
export const EndingVariantSchema = z.object({
    id: z.string(),
    triggerConditions: z.array(ReleaseRuleSchema),
    title: z.string(),
    body: z.string(),
    imageUrl: z.string().optional(),
});
export const EndingConfigSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
    triggerConditions: z.array(ReleaseRuleSchema),
    body: z.string(),
    allowContinueAfter: z.boolean(),
    allowRestart: z.boolean(),
    variants: z.array(EndingVariantSchema).optional(),
});
export const EmailSenderSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
});
export const IMParticipantSchema = z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string().optional(),
});
export const FileFolderSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    parentId: z.string().optional(),
});
export const CalendarConfigSchema = z.object({
    id: z.string(),
    ownerName: z.string(),
});
// ==================== STORY ====================
export const StorySchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    author: z.string(),
    version: z.string(),
    theme: ThemeConfigSchema,
    login: LoginConfigSchema,
    ending: EndingConfigSchema,
    globalSettings: z.record(z.any()).optional(),
    artefacts: z.array(ArtefactSchema),
    emailSenders: z.array(EmailSenderSchema),
    imParticipants: z.array(IMParticipantSchema),
    fileStructure: z.array(FileFolderSchema),
    calendarConfig: CalendarConfigSchema,
    created: z.number(),
    modified: z.number(),
});
// ==================== ASSET ====================
export const AssetSchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    filename: z.string().min(1),
    type: z.enum(['image', 'audio']),
    size: z.number().min(0),
    data: z.string(),
    created: z.number(),
    mimeType: z.string(),
});
