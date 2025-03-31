import { FileArchetype } from "./archetype.ts";

interface MakeTarget {
  dependencies?: string[];
  recipe?: string[];
}

// interface MakeFileVariable {
//   name: string;
//   value: string;
//   conditionallySet: boolean;
// }

interface MakefileConfig {
  targets?: Record<string, MakeTarget>;
  // variables?: MakeFileVariable[];
}

export class MakeFile extends FileArchetype {
  private targets: Map<string, MakeTarget>;

  constructor(filePath: string, config: MakefileConfig) {
    super(filePath);
    this.targets = new Map(Object.entries(config.targets ?? {}));
  }

  public addTarget(targetName: string, targetDefinition: MakeTarget) {
    if (this.targets.has(targetName)) {
      throw new Error(`Target ${targetName} already exists`);
    }
    this.targets.set(targetName, targetDefinition);
  }

  public async generate() {
    let content = "";
    for (const [targetName, targetDefinition] of this.targets) {
      let targetHeader = `${targetName}:`;
      if (
        targetDefinition.dependencies !== undefined &&
        targetDefinition.dependencies.length > 0
      ) {
        targetHeader += ` ${targetDefinition.dependencies.join(" ")}`;
      }

      content += targetHeader + "\n";

      for (const recipeStep of targetDefinition.recipe ?? []) {
        const _recipeStep = recipeStep.split("\n");

        let parsedRecipeStep = _recipeStep.shift();

        parsedRecipeStep += _recipeStep.reduce(
          (parsed, line) => parsed + ` \\\n    ${line.trim()}`,
          ""
        );

        content += `\t${parsedRecipeStep}\n`;
      }
      content += "\n";
    }

    await this._generate(content.trim() + "\n");
  }
}
