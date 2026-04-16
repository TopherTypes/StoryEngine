import { Project } from "./Project.js";
import type { ProjectFile } from "./types.js";

export class FileIOError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "FileIOError";
  }
}

export async function saveProject(project: Project, filePath: string): Promise<void> {
  try {
    const { writeFile } = await import("fs/promises");
    const data = project.toJSON();
    const jsonContent = JSON.stringify(data, null, 2);
    await writeFile(filePath, jsonContent, "utf-8");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw new FileIOError(
          `Cannot save project: directory does not exist (${filePath})`,
          "DIRECTORY_NOT_FOUND"
        );
      }
      if (error.message.includes("EACCES")) {
        throw new FileIOError(
          `Cannot save project: permission denied (${filePath})`,
          "PERMISSION_DENIED"
        );
      }
      throw new FileIOError(
        `Failed to save project: ${error.message}`,
        "WRITE_ERROR"
      );
    }
    throw error;
  }
}

export async function loadProject(filePath: string): Promise<Project> {
  try {
    const { readFile } = await import("fs/promises");
    const content = await readFile(filePath, "utf-8");
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch (parseError) {
      throw new FileIOError(
        `Cannot parse project file: invalid JSON format (${filePath})`,
        "CORRUPTED_FILE"
      );
    }

    return Project.fromJSON(data, filePath);
  } catch (error) {
    if (error instanceof FileIOError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw new FileIOError(
          `Project file not found (${filePath})`,
          "FILE_NOT_FOUND"
        );
      }
      if (error.message.includes("EACCES")) {
        throw new FileIOError(
          `Cannot read project: permission denied (${filePath})`,
          "PERMISSION_DENIED"
        );
      }
      throw new FileIOError(
        `Failed to load project: ${error.message}`,
        "READ_ERROR"
      );
    }
    throw error;
  }
}

// Browser implementation for exporting/importing
export function projectToBlob(project: Project): Blob {
  const data = project.toJSON();
  const jsonContent = JSON.stringify(data, null, 2);
  return new Blob([jsonContent], { type: "application/json" });
}

export async function projectFromBlob(blob: Blob, filePath?: string): Promise<Project> {
  try {
    const content = await blob.text();
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch (parseError) {
      throw new FileIOError(
        "Cannot parse project file: invalid JSON format",
        "CORRUPTED_FILE"
      );
    }

    return Project.fromJSON(data, filePath);
  } catch (error) {
    if (error instanceof FileIOError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new FileIOError(
        `Failed to load project: ${error.message}`,
        "READ_ERROR"
      );
    }
    throw error;
  }
}

export function downloadProject(project: Project, filename: string): void {
  const blob = projectToBlob(project);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
