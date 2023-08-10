export interface SimConf {
  question: string;
  temperature: string;
  characters: {
    name: string;
    personality: string;
    past: string;
    status: string;
    plan: string;
  }[];
  prePrompt: string;
  postPrompt: string;
}
