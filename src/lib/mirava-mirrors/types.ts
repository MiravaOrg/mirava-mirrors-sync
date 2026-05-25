export type Mirror = {
  name: string;
  url: string;
  description: string;
  packages: Array<string>;
  packageUrls?: Array<{
    name: string;
    url: string;
  }>;
};

export type MirrorsListResponse = {
  official_iran_mirrors: Array<Mirror>;
  global_mirrors: Array<Mirror>;
}