export const NPM_REGISTRY = 'https://registry.npmjs.org/';

export const TRUSTED_REGISTRY_ARGS = [
  `--registry=${NPM_REGISTRY}`,
  `--@archsmith:registry=${NPM_REGISTRY}`,
] as const;
