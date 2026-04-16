import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { saveProject, loadProject, FileIOError } from "./fileIO.js";
import { Project } from "./Project.js";
import { promises as fs } from "fs";
import { existsSync, unlinkSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("File I/O Operations", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `storyengine-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test files
    if (existsSync(testDir)) {
      const files = await fs.readdir(testDir);
      for (const file of files) {
        try {
          await fs.unlink(join(testDir, file));
        } catch {
          // Ignore errors during cleanup
        }
      }
      try {
        rmdirSync(testDir);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  const createTestProject = (title: string = "Test Project"): Project => {
    return new Project({
      id: "test-project-1",
      title,
      description: "A test project",
      author: "Test Author",
      version: "1.0.0"
    });
  };

  describe("saveProject", () => {
    it("should save project to disk", async () => {
      const project = createTestProject();
      const filePath = join(testDir, "test-project.json");

      await saveProject(project, filePath);

      expect(existsSync(filePath)).toBe(true);
    });

    it("should save valid JSON format", async () => {
      const project = createTestProject();
      const filePath = join(testDir, "test-project.json");

      await saveProject(project, filePath);

      const content = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.artefacts).toBeDefined();
      expect(parsed.assets).toBeDefined();
    });

    it("should save all project data correctly", async () => {
      const project = createTestProject();
      const filePath = join(testDir, "test-project.json");

      project.addAsset({
        id: "asset-1",
        filename: "test.png",
        mimeType: "image/png",
        fileSize: 1024,
        hash: "abc123",
        data: "base64encodeddata"
      });

      await saveProject(project, filePath);

      const content = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed.assets).toHaveLength(1);
      expect(parsed.assets[0].filename).toBe("test.png");
    });

    it("should throw error when directory does not exist", async () => {
      const project = createTestProject();
      const filePath = join("/nonexistent/directory", "test-project.json");

      await expect(saveProject(project, filePath)).rejects.toThrow(FileIOError);
      try {
        await saveProject(project, filePath);
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.code).toBe("DIRECTORY_NOT_FOUND");
        }
      }
    });
  });

  describe("loadProject", () => {
    it("should load saved project from disk", async () => {
      const original = createTestProject();
      const filePath = join(testDir, "test-project.json");

      await saveProject(original, filePath);
      const loaded = await loadProject(filePath);

      expect(loaded.getMetadata()).toEqual(original.getMetadata());
    });

    it("should preserve all data when loading", async () => {
      const original = createTestProject();
      const filePath = join(testDir, "test-project.json");

      original.addAsset({
        id: "asset-1",
        filename: "test.png",
        mimeType: "image/png",
        fileSize: 1024,
        hash: "abc123",
        data: "base64encodeddata"
      });

      await saveProject(original, filePath);
      const loaded = await loadProject(filePath);

      expect(loaded.getAssets()).toHaveLength(1);
      expect(loaded.getAssets()[0].filename).toBe("test.png");
    });

    it("should preserve file path after loading", async () => {
      const original = createTestProject();
      const filePath = join(testDir, "test-project.json");

      await saveProject(original, filePath);
      const loaded = await loadProject(filePath);

      expect(loaded.getFilePath()).toBe(filePath);
    });

    it("should throw error for non-existent file", async () => {
      const filePath = join(testDir, "nonexistent.json");

      await expect(loadProject(filePath)).rejects.toThrow(FileIOError);
      try {
        await loadProject(filePath);
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.code).toBe("FILE_NOT_FOUND");
        }
      }
    });

    it("should throw error for corrupted JSON", async () => {
      const filePath = join(testDir, "corrupted.json");
      await fs.writeFile(filePath, "{ invalid json ]", "utf-8");

      await expect(loadProject(filePath)).rejects.toThrow(FileIOError);
      try {
        await loadProject(filePath);
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.code).toBe("CORRUPTED_FILE");
        }
      }
    });

    it("should throw error for missing metadata", async () => {
      const filePath = join(testDir, "invalid.json");
      await fs.writeFile(filePath, JSON.stringify({ artefacts: [] }), "utf-8");

      await expect(loadProject(filePath)).rejects.toThrow();
    });
  });

  describe("round-trip file I/O", () => {
    it("should save and load project with all fields intact", async () => {
      const original = createTestProject("Complex Project");
      const filePath = join(testDir, "round-trip.json");

      original.setMetadata({
        title: "Complex Project",
        description: "A complex test project with all fields"
      });

      original.addAsset({
        id: "asset-1",
        filename: "image.png",
        mimeType: "image/png",
        fileSize: 2048,
        hash: "def456",
        data: "base64encodedimage"
      });

      original.addCondition({
        id: "cond-1",
        type: "elapsed_time",
        minutes: 15
      });

      original.addReleaseRule({
        id: "rule-1",
        conditions: [],
        operator: "AND"
      });

      original.addEmailThread({
        id: "thread-1",
        subject: "Test Thread",
        artefactIds: []
      });

      await saveProject(original, filePath);
      const loaded = await loadProject(filePath);

      expect(loaded.getMetadata().title).toBe("Complex Project");
      expect(loaded.getMetadata().description).toBe("A complex test project with all fields");
      expect(loaded.getAssets()).toHaveLength(1);
      expect(loaded.getConditions()).toHaveLength(1);
      expect(loaded.getReleaseRules()).toHaveLength(1);
      expect(loaded.getEmailThreads()).toHaveLength(1);
    });

    it("should match original data exactly after load", async () => {
      const original = createTestProject();
      const filePath = join(testDir, "exact-match.json");

      await saveProject(original, filePath);
      const loaded = await loadProject(filePath);

      const originalData = original.toJSON();
      const loadedData = loaded.toJSON();

      expect(loadedData.metadata).toEqual(originalData.metadata);
      expect(loadedData.artefacts).toEqual(originalData.artefacts);
      expect(loadedData.assets).toEqual(originalData.assets);
      expect(loadedData.conditions).toEqual(originalData.conditions);
      expect(loadedData.releaseRules).toEqual(originalData.releaseRules);
    });
  });

  describe("error handling", () => {
    it("should provide clear error messages for file operations", async () => {
      const project = createTestProject();
      const filePath = join("/invalid/nonexistent/path", "project.json");

      try {
        await saveProject(project, filePath);
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.message).toContain("Cannot save project");
          expect(error.code).toBeDefined();
        }
      }
    });

    it("should distinguish between different error types", async () => {
      // Non-existent file
      try {
        await loadProject(join(testDir, "does-not-exist.json"));
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.code).toBe("FILE_NOT_FOUND");
        }
      }

      // Corrupted file
      const corruptedPath = join(testDir, "corrupted.json");
      await fs.writeFile(corruptedPath, "{{{", "utf-8");

      try {
        await loadProject(corruptedPath);
      } catch (error) {
        if (error instanceof FileIOError) {
          expect(error.code).toBe("CORRUPTED_FILE");
        }
      }
    });
  });
});
