import { FileArchetype } from "./archetype.ts";
import { stringify as stringifyYaml } from "yaml";

interface DockerComposeService {
  image?: string;
  environment?: Record<string, string>;
  volumes?: Record<string, string>;
  working_dir?: string;
}

interface DockerComposeConfig {
  services?: Record<string, DockerComposeService>;
}

export class DockerCompose extends FileArchetype {
  private config: DockerComposeConfig;

  constructor(filePath: string, config: DockerComposeConfig) {
    super(filePath);
    this.config = config;
  }

  private parseService(service: DockerComposeService) {
    return {
      ...service,
      environment: Object.entries(service.environment ?? {}).map(
        ([key, value]) => `${key}=${value}`
      ),
      volumes: Object.entries(service.volumes ?? {}).map(
        ([key, value]) => `${key}:${value}`
      ),
    };
  }

  private parseServices(services: Record<string, DockerComposeService>) {
    return Object.entries(services).reduce(
      (services, [key, value]) => ({
        ...services,
        [key]: this.parseService(value),
      }),
      {}
    );
  }

  public async generate() {
    const parsedConfig = {
      ...this.config,
      services: this.parseServices(this.config.services ?? {}),
    };

    const content = stringifyYaml(parsedConfig);

    await this._generate(content);
  }
}
