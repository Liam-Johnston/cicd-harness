import type { FileArchetype } from "./file-types/archetype.ts";
import { join } from "path";

export * from "./file-types/index.ts";

export interface HarnessManagerConfig {
  harnessStateDirectory?: string;
  filesToCreate?: FileArchetype[];
}

export class HarnessManager {
  private filesToCreate: FileArchetype[];
  private generatedFileStore;
  private harnessStateDirectory: string;

  constructor(config: HarnessManagerConfig) {
    this.filesToCreate = config.filesToCreate ?? [];
    this.harnessStateDirectory =
      config.harnessStateDirectory ?? ".cicd-harness";
    this.generatedFileStore = join(
      this.harnessStateDirectory,
      "_generated_files"
    );
  }

  async _handleFileGeneration(file: FileArchetype) {
    const existingFile = Bun.file(file.path);

    if (await existingFile.exists()) {
      const existingContents = await existingFile.arrayBuffer();

      await Bun.write(
        join(this.harnessStateDirectory, file.path),
        existingContents
      );
    }

    await file.generate();

    return file.path;
  }

  async generate() {
    const generatedFiles = await Promise.all(
      this.filesToCreate.map((file) => this._handleFileGeneration(file))
    );

    await Bun.write(this.generatedFileStore, JSON.stringify(generatedFiles));
  }

  async cleanUp() {
    const generatedFiles: string[] = await Bun.file(
      this.generatedFileStore
    ).json();

    await Promise.all(
      generatedFiles.map(async (file) => {
        const currentFile = Bun.file(file);
        await currentFile.unlink();

        const previousFile = Bun.file(join(this.harnessStateDirectory, file));

        if (await previousFile.exists()) {
          const previousContent = await previousFile.arrayBuffer();

          await Bun.write(currentFile, previousContent);

          await previousFile.unlink();
        }
      })
    );

    await Bun.file(this.generatedFileStore).unlink();
  }
}
