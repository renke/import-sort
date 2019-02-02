import * as cosmiconfig from "cosmiconfig";
import * as minimatch from "minimatch";
import {silent as resolve} from "resolve-from";

export interface IConfigByGlobs {
  [globs: string]: IConfig;
}

export interface IConfig {
  parser?: string;
  style?: string;
  options?: object;
}

export interface IResolvedConfig {
  config: IConfig;

  parser?: string;
  style?: string;
}

export const DEFAULT_CONFIGS: IConfigByGlobs = {
  ".js, .jsx, .es6, .es": {
    parser: "babylon",
    style: "eslint",
  },
  ".ts, .tsx": {
    parser: "typescript",
    style: "eslint",
  },
};

export function getConfig(
  extension: string,
  directory?: string,
  defaultConfigs = DEFAULT_CONFIGS,
): IResolvedConfig | undefined {
  const defaultConfig = getConfigForExtension(defaultConfigs, extension);
  let packageConfig: IConfig | undefined;

  if (directory) {
    packageConfig = getConfigFromDirectory(directory, extension);
  }

  const actualConfig = mergeConfigs([defaultConfig, packageConfig]);

  if (!actualConfig) {
    return undefined;
  }

  const resolvedConfig = resolveConfig(actualConfig, directory);

  return resolvedConfig;
}

function getConfigFromDirectory(
  directory: string,
  extension: string,
): IConfig | undefined {
  const packageConfigs = getAllConfigsFromDirectory(directory);

  if (!packageConfigs) {
    return undefined;
  }

  return getConfigForExtension(packageConfigs, extension);
}

function getConfigForExtension(
  configs: IConfigByGlobs,
  extension: string,
): IConfig | undefined {
  const foundConfigs: (IConfig | undefined)[] = Object.keys(configs).map(
    joinedGlobs => {
      const globs = joinedGlobs.split(",").map(rawGlob => rawGlob.trim());
      const config = configs[joinedGlobs];

      if (globs.some(glob => minimatch(extension, glob))) {
        return config;
      }

      return undefined;
    },
  );

  return mergeConfigs(foundConfigs);
}

function getAllConfigsFromDirectory(
  directory: string,
): IConfigByGlobs | undefined {
  const configsLoader = cosmiconfig("importsort", {
    sync: true,
    packageProp: "importSort",
    rcExtensions: true,
  });

  try {
    const configsResult = configsLoader.searchSync(directory);

    if (!configsResult) {
      return undefined;
    }

    return configsResult.config;
  } catch (e) {
    // Do nothing…
  }

  return undefined;
}

function mergeConfigs(
  rawConfigs: (IConfig | undefined)[],
): IConfig | undefined {
  const configs = rawConfigs.filter(rawConfig => !!rawConfig) as IConfig[];

  if (configs.length === 0) {
    return undefined;
  }

  return configs.reduce((previousConfig, currentConfig) => {
    if (!currentConfig) {
      return previousConfig;
    }

    const config = {...previousConfig};

    if (currentConfig.parser) {
      config.parser = currentConfig.parser;
    }

    if (currentConfig.style) {
      config.style = currentConfig.style;
    }

    if (currentConfig.options) {
      config.options = currentConfig.options;
    }

    return config;
  });
}

function resolveConfig(config: IConfig, directory?: string): IResolvedConfig {
  const resolvedConfig: IResolvedConfig = {
    config,
  };

  if (config.parser) {
    resolvedConfig.parser = resolveParser(config.parser, directory);
  }

  if (config.style) {
    resolvedConfig.style = resolveStyle(config.style, directory);
  }

  return resolvedConfig;
}

function resolveParser(module: string, directory?: string) {
  return (
    resolveModule(`import-sort-parser-${module}`, directory) ||
    resolveModule(module, directory)
  );
}

function resolveStyle(module: string, directory?: string) {
  return (
    resolveModule(`import-sort-style-${module}`, directory) ||
    resolveModule(module, directory)
  );
}

function resolveModule(module: string, directory?: string): string | undefined {
  if (directory) {
    const path = resolve(directory, module);

    if (path) {
      return path;
    }
  }

  const defaultPath = resolve(__dirname, module);

  if (defaultPath) {
    return defaultPath;
  }

  return undefined;
}
