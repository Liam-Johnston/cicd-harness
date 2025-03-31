export class FileArchetype {
  public path: string;

  constructor(path: string) {
    this.path = path;
  }

  protected async _generate(fileContents: string): Promise<void> {
    await Bun.write(this.path, fileContents);
  }

  public async generate(): Promise<void> {
    await this._generate("");
  }

  public async delete(): Promise<void> {
    await Bun.file(this.path).delete();
  }
}
