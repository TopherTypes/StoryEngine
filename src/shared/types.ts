// Story metadata and configuration
export interface StoryMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
}

// Artefact type enum
export enum ArtefactType {
  Email = "email",
  IM = "im",
  Calendar = "calendar",
  Document = "document",
  Image = "image",
  Audio = "audio"
}

// Condition types
export enum ConditionType {
  ElapsedTime = "elapsed_time",
  ArtefactOpened = "artefact_opened",
  PasswordEntered = "password_entered"
}

// Base condition interface
export interface Condition {
  id: string;
  type: ConditionType;
}

export interface ElapsedTimeCondition extends Condition {
  type: ConditionType.ElapsedTime;
  minutes: number;
}

export interface ArtefactOpenedCondition extends Condition {
  type: ConditionType.ArtefactOpened;
  targetArtefactId: string;
}

export interface PasswordEnteredCondition extends Condition {
  type: ConditionType.PasswordEntered;
  targetLockId: string;
}

export type AnyCondition = ElapsedTimeCondition | ArtefactOpenedCondition | PasswordEnteredCondition;

// Release rule
export interface ReleaseRule {
  id: string;
  conditions: AnyCondition[];
  operator: "AND" | "OR";
}

// Base artefact interface
export interface BaseArtefact {
  id: string;
  type: ArtefactType;
  label: string;
  visibleTitle: string;
  body: string;
  assetReferences: string[];
  placement: {
    app: string;
    context?: string;
  };
  releaseRuleId?: string;
  locked: boolean;
  lockPassword?: string;
  lockHint?: string;
}

// Artefact type-specific fields
export interface EmailArtefact extends BaseArtefact {
  type: ArtefactType.Email;
  sender: string;
  recipients: string[];
  subject: string;
  threadId?: string;
  timestamp?: number;
}

export interface IMArtefact extends BaseArtefact {
  type: ArtefactType.IM;
  conversationId?: string;
  sender: string;
  displayOrder: number;
}

export interface CalendarArtefact extends BaseArtefact {
  type: ArtefactType.Calendar;
  eventTitle: string;
  date: string;
  time: string;
  description: string;
  attendees: string[];
}

export interface DocumentArtefact extends BaseArtefact {
  type: ArtefactType.Document;
  documentTitle: string;
  folderPath: string;
}

export interface ImageArtefact extends BaseArtefact {
  type: ArtefactType.Image;
  imageAssetId: string;
  caption?: string;
  folderPath: string;
}

export interface AudioArtefact extends BaseArtefact {
  type: ArtefactType.Audio;
  audioAssetId: string;
  folderPath: string;
}

// Union type for all artefacts
export type Artefact = EmailArtefact | IMArtefact | CalendarArtefact | DocumentArtefact | ImageArtefact | AudioArtefact;

// Asset
export interface Asset {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  hash: string;
  data: string; // Base64 encoded or file path reference
}

// Container structures
export interface EmailThread {
  id: string;
  subject: string;
  artefactIds: string[];
}

export interface IMConversation {
  id: string;
  participantNames: string[];
  artefactIds: string[];
}

export interface FileFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  artefactIds: string[];
}

// File format for saved projects
export interface ProjectFile {
  schemaVersion: string;
  createdAt: string;
  lastModifiedAt: string;
  toolVersion: string;
  metadata: StoryMetadata;
  artefacts: Artefact[];
  assets: Asset[];
  conditions: AnyCondition[];
  releaseRules: ReleaseRule[];
  emailThreads: EmailThread[];
  imConversations: IMConversation[];
  fileFolders: FileFolder[];
}
