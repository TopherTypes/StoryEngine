import { describe, it, expect } from "vitest";
import { Project } from "./Project.js";
import type { StoryMetadata, EmailArtefact, IMArtefact } from "./types.js";
import { ArtefactType, ConditionType } from "./types.js";

describe("Project Class", () => {
  const createTestMetadata = (): StoryMetadata => ({
    id: "test-project-1",
    title: "Test Project",
    description: "A test project",
    author: "Test Author",
    version: "1.0.0"
  });

  describe("instantiation", () => {
    it("should instantiate with metadata", () => {
      const metadata = createTestMetadata();
      const project = new Project(metadata);

      expect(project.getMetadata()).toEqual(metadata);
    });

    it("should initialize with empty collections", () => {
      const metadata = createTestMetadata();
      const project = new Project(metadata);

      expect(project.getArtefacts()).toEqual([]);
      expect(project.getAssets()).toEqual([]);
      expect(project.getConditions()).toEqual([]);
      expect(project.getReleaseRules()).toEqual([]);
      expect(project.getEmailThreads()).toEqual([]);
      expect(project.getIMConversations()).toEqual([]);
      expect(project.getFileFolders()).toEqual([]);
    });
  });

  describe("metadata operations", () => {
    it("should update metadata", () => {
      const metadata = createTestMetadata();
      const project = new Project(metadata);

      project.setMetadata({ title: "Updated Title" });

      const updated = project.getMetadata();
      expect(updated.title).toBe("Updated Title");
      expect(updated.author).toBe("Test Author");
    });

    it("should return independent metadata copies", () => {
      const metadata = createTestMetadata();
      const project = new Project(metadata);

      const copy1 = project.getMetadata();
      copy1.title = "Modified";

      const copy2 = project.getMetadata();
      expect(copy2.title).toBe("Test Project");
    });
  });

  describe("artefact operations", () => {
    it("should add and retrieve artefacts", () => {
      const project = new Project(createTestMetadata());
      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: [],
        placement: { app: "email" },
        locked: false,
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      project.addArtefact(email);
      const artefacts = project.getArtefacts();

      expect(artefacts).toHaveLength(1);
      expect(artefacts[0].id).toBe("email-1");
    });

    it("should remove artefacts by ID", () => {
      const project = new Project(createTestMetadata());
      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: [],
        placement: { app: "email" },
        locked: false,
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      project.addArtefact(email);
      project.removeArtefact("email-1");

      expect(project.getArtefacts()).toHaveLength(0);
    });

    it("should return independent artefact copies", () => {
      const project = new Project(createTestMetadata());
      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: [],
        placement: { app: "email" },
        locked: false,
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      project.addArtefact(email);
      const artefacts1 = project.getArtefacts();
      artefacts1[0].visibleTitle = "Modified";

      const artefacts2 = project.getArtefacts();
      expect(artefacts2[0].visibleTitle).toBe("Test Email");
    });
  });

  describe("asset operations", () => {
    it("should add and retrieve assets", () => {
      const project = new Project(createTestMetadata());
      const asset = {
        id: "asset-1",
        filename: "test.png",
        mimeType: "image/png",
        fileSize: 1024,
        hash: "abc123",
        data: "base64encodeddata"
      };

      project.addAsset(asset);
      const assets = project.getAssets();

      expect(assets).toHaveLength(1);
      expect(assets[0].filename).toBe("test.png");
    });

    it("should remove assets by ID", () => {
      const project = new Project(createTestMetadata());
      const asset = {
        id: "asset-1",
        filename: "test.png",
        mimeType: "image/png",
        fileSize: 1024,
        hash: "abc123",
        data: "base64encodeddata"
      };

      project.addAsset(asset);
      project.removeAsset("asset-1");

      expect(project.getAssets()).toHaveLength(0);
    });
  });

  describe("condition operations", () => {
    it("should add and retrieve conditions", () => {
      const project = new Project(createTestMetadata());
      const condition = {
        id: "cond-1",
        type: ConditionType.ElapsedTime,
        minutes: 10
      };

      project.addCondition(condition);
      const conditions = project.getConditions();

      expect(conditions).toHaveLength(1);
      expect(conditions[0].type).toBe(ConditionType.ElapsedTime);
    });

    it("should remove conditions by ID", () => {
      const project = new Project(createTestMetadata());
      const condition = {
        id: "cond-1",
        type: ConditionType.ElapsedTime,
        minutes: 10
      };

      project.addCondition(condition);
      project.removeCondition("cond-1");

      expect(project.getConditions()).toHaveLength(0);
    });
  });

  describe("release rule operations", () => {
    it("should add and retrieve release rules", () => {
      const project = new Project(createTestMetadata());
      const rule = {
        id: "rule-1",
        conditions: [
          {
            id: "cond-1",
            type: ConditionType.ElapsedTime,
            minutes: 10
          }
        ],
        operator: "AND" as const
      };

      project.addReleaseRule(rule);
      const rules = project.getReleaseRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("rule-1");
    });

    it("should remove release rules by ID", () => {
      const project = new Project(createTestMetadata());
      const rule = {
        id: "rule-1",
        conditions: [],
        operator: "AND" as const
      };

      project.addReleaseRule(rule);
      project.removeReleaseRule("rule-1");

      expect(project.getReleaseRules()).toHaveLength(0);
    });
  });

  describe("serialization", () => {
    it("should serialize to JSON with all data", () => {
      const project = new Project(createTestMetadata());
      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: [],
        placement: { app: "email" },
        locked: false,
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      project.addArtefact(email);

      const json = project.toJSON();

      expect(json.schemaVersion).toBeDefined();
      expect(json.metadata).toEqual(project.getMetadata());
      expect(json.artefacts).toHaveLength(1);
      expect(json.artefacts[0].id).toBe("email-1");
    });

    it("should include timestamps in serialized data", () => {
      const project = new Project(createTestMetadata());
      const json = project.toJSON();

      expect(json.createdAt).toBeDefined();
      expect(json.lastModifiedAt).toBeDefined();
    });

    it("should include tool version in serialized data", () => {
      const project = new Project(createTestMetadata());
      const json = project.toJSON();

      expect(json.toolVersion).toBeDefined();
      expect(json.toolVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("deserialization", () => {
    it("should deserialize from valid JSON", () => {
      const metadata = createTestMetadata();
      const project = new Project(metadata);
      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: [],
        placement: { app: "email" },
        locked: false,
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      project.addArtefact(email);
      const json = project.toJSON();

      const restored = Project.fromJSON(json);

      expect(restored.getMetadata()).toEqual(metadata);
      expect(restored.getArtefacts()).toHaveLength(1);
      expect(restored.getArtefacts()[0].id).toBe("email-1");
    });

    it("should restore file path when deserializing", () => {
      const json = {
        schemaVersion: "0.1.0",
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        toolVersion: "0.1.0",
        metadata: createTestMetadata(),
        artefacts: [],
        assets: [],
        conditions: [],
        releaseRules: [],
        emailThreads: [],
        imConversations: [],
        fileFolders: []
      };

      const restored = Project.fromJSON(json, "/path/to/project.json");

      expect(restored.getFilePath()).toBe("/path/to/project.json");
    });

    it("should throw on invalid JSON data", () => {
      expect(() => {
        Project.fromJSON(null);
      }).toThrow();
    });

    it("should throw on missing metadata", () => {
      expect(() => {
        Project.fromJSON({
          schemaVersion: "0.1.0",
          artefacts: []
        });
      }).toThrow("missing metadata");
    });

    it("should handle missing optional collections", () => {
      const json = {
        metadata: createTestMetadata()
      };

      const restored = Project.fromJSON(json);

      expect(restored.getArtefacts()).toEqual([]);
      expect(restored.getAssets()).toEqual([]);
    });
  });

  describe("round-trip serialization", () => {
    it("should preserve all data through save/load cycle", () => {
      const original = new Project(createTestMetadata());

      const email: EmailArtefact = {
        id: "email-1",
        type: ArtefactType.Email,
        label: "Email 1",
        visibleTitle: "Test Email",
        body: "Test body",
        assetReferences: ["asset-1"],
        placement: { app: "email", context: "inbox" },
        locked: true,
        lockPassword: "password123",
        lockHint: "hint",
        sender: "sender@example.com",
        recipients: ["recipient@example.com"],
        subject: "Test Subject"
      };

      const im: IMArtefact = {
        id: "im-1",
        type: ArtefactType.IM,
        label: "IM 1",
        visibleTitle: "Test IM",
        body: "Test message",
        assetReferences: [],
        placement: { app: "im" },
        locked: false,
        conversationId: "conv-1",
        sender: "user1",
        displayOrder: 1
      };

      original.addArtefact(email);
      original.addArtefact(im);

      const asset = {
        id: "asset-1",
        filename: "test.png",
        mimeType: "image/png",
        fileSize: 1024,
        hash: "abc123",
        data: "base64encodeddata"
      };

      original.addAsset(asset);

      const json = original.toJSON();
      const restored = Project.fromJSON(json);

      expect(restored.getMetadata()).toEqual(original.getMetadata());
      expect(restored.getArtefacts()).toHaveLength(2);
      expect(restored.getAssets()).toHaveLength(1);
      expect(restored.getAssets()[0]).toEqual(asset);
    });
  });
});
