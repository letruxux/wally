import projectsJson from "../data/projects.json";
import developersJson from "../data/developers.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Thing = Record<string, any>;

export interface ProjectCustomData {
  deprecated: boolean;
  recommended_alternative: string;
  deprecation_message: string;
  name: string;
  github_link: string;
  type: "original" | "fork" | "uploaded";
}

export interface DeveloperCustomData {
  github_link: string;
  badges: string;
  name: string;
}

export function getDeveloperInfo(name: string): DeveloperCustomData | null {
  const dev = (developersJson as Thing)[name];
  return dev ?? null;
}

export function getProjectInfo(name: string): ProjectCustomData | null {
  const proj = (projectsJson as Thing)[name];
  return proj ?? null;
}
