import type {
  ProjectFile,
  StoryMetadata,
  Artefact,
  Asset,
  AnyCondition,
  ReleaseRule,
  EmailThread,
  IMConversation,
  FileFolder
} from "./types.js";

const SCHEMA_VERSION = "0.1.0";
const TOOL_VERSION = "0.1.0";

export class Project {
  private metadata: StoryMetadata;
  private artefacts: Artefact[] = [];
  private assets: Asset[] = [];
  private conditions: AnyCondition[] = [];
  private releaseRules: ReleaseRule[] = [];
  private emailThreads: EmailThread[] = [];
  private imConversations: IMConversation[] = [];
  private fileFolders: FileFolder[] = [];
  private filePath?: string;

  constructor(metadata: StoryMetadata) {
    this.metadata = metadata;
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // Getters
  getMetadata(): StoryMetadata {
    return { ...this.metadata };
  }

  getArtefacts(): Artefact[] {
    return this.artefacts.map(a => this.deepCopy(a));
  }

  getAssets(): Asset[] {
    return this.assets.map(a => this.deepCopy(a));
  }

  getConditions(): AnyCondition[] {
    return this.conditions.map(c => this.deepCopy(c));
  }

  getReleaseRules(): ReleaseRule[] {
    return this.releaseRules.map(r => this.deepCopy(r));
  }

  getEmailThreads(): EmailThread[] {
    return this.emailThreads.map(t => this.deepCopy(t));
  }

  getIMConversations(): IMConversation[] {
    return this.imConversations.map(c => this.deepCopy(c));
  }

  getFileFolders(): FileFolder[] {
    return this.fileFolders.map(f => this.deepCopy(f));
  }

  getFilePath(): string | undefined {
    return this.filePath;
  }

  // Mutators
  setMetadata(metadata: Partial<StoryMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  addArtefact(artefact: Artefact): void {
    this.artefacts.push(artefact);
  }

  removeArtefact(artefactId: string): void {
    this.artefacts = this.artefacts.filter(a => a.id !== artefactId);
  }

  addAsset(asset: Asset): void {
    this.assets.push(asset);
  }

  removeAsset(assetId: string): void {
    this.assets = this.assets.filter(a => a.id !== assetId);
  }

  addCondition(condition: AnyCondition): void {
    this.conditions.push(condition);
  }

  removeCondition(conditionId: string): void {
    this.conditions = this.conditions.filter(c => c.id !== conditionId);
  }

  addReleaseRule(rule: ReleaseRule): void {
    this.releaseRules.push(rule);
  }

  removeReleaseRule(ruleId: string): void {
    this.releaseRules = this.releaseRules.filter(r => r.id !== ruleId);
  }

  addEmailThread(thread: EmailThread): void {
    this.emailThreads.push(thread);
  }

  removeEmailThread(threadId: string): void {
    this.emailThreads = this.emailThreads.filter(t => t.id !== threadId);
  }

  addIMConversation(conversation: IMConversation): void {
    this.imConversations.push(conversation);
  }

  removeIMConversation(conversationId: string): void {
    this.imConversations = this.imConversations.filter(c => c.id !== conversationId);
  }

  addFileFolder(folder: FileFolder): void {
    this.fileFolders.push(folder);
  }

  removeFileFolder(folderId: string): void {
    this.fileFolders = this.fileFolders.filter(f => f.id !== folderId);
  }

  // Serialization
  toJSON(): ProjectFile {
    return {
      schemaVersion: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      toolVersion: TOOL_VERSION,
      metadata: this.metadata,
      artefacts: this.artefacts,
      assets: this.assets,
      conditions: this.conditions,
      releaseRules: this.releaseRules,
      emailThreads: this.emailThreads,
      imConversations: this.imConversations,
      fileFolders: this.fileFolders
    };
  }

  // Deserialization
  static fromJSON(data: unknown, filePath?: string): Project {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid project data: expected an object");
    }

    const file = data as ProjectFile;

    if (!file.metadata) {
      throw new Error("Invalid project file: missing metadata");
    }

    const project = new Project(file.metadata);
    project.filePath = filePath;

    if (Array.isArray(file.artefacts)) {
      project.artefacts = file.artefacts;
    }

    if (Array.isArray(file.assets)) {
      project.assets = file.assets;
    }

    if (Array.isArray(file.conditions)) {
      project.conditions = file.conditions;
    }

    if (Array.isArray(file.releaseRules)) {
      project.releaseRules = file.releaseRules;
    }

    if (Array.isArray(file.emailThreads)) {
      project.emailThreads = file.emailThreads;
    }

    if (Array.isArray(file.imConversations)) {
      project.imConversations = file.imConversations;
    }

    if (Array.isArray(file.fileFolders)) {
      project.fileFolders = file.fileFolders;
    }

    return project;
  }
}
