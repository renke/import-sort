import * as assign from "core-js/library/fn/object/assign";
import * as minimatch from "minimatch";

import {readFileSync} from "fs";

import findRoot = require("find-root");

const resolve = require("resolve-from").silent;

export interface IConfigByGlobs {
  [globs: string]: IConfig;
}

export interface IConfig {
  parser?: string;
  style?: string;
}

export interface IResolvedConfig {
  config: IConfig;

  parser?: string;
  style?: string;
};

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

export function getConfig(extension: string, directory?: string, defaultSettings = DEFAULT_CONFIGS): IResolvedConfig | undefined {
  const defaultConfig = getConfigForExtension(defaultSettings, extension);
  let packageConfig: IConfig | undefined;

  if (directory) {
    packageConfig = getConfigFromPackage(directory, extension);
  }

  const actualConfig = mergeConfigs([defaultConfig, packageConfig]);

  if (!actualConfig) {
    return;
  }

  return resolveConfig(actualConfig, directory);
}

function getConfigFromPackage(directory: string, extension: string): IConfig | undefined {
  const packageConfigs = getConfigsFromPackage(directory);

  if (!packageConfigs) {
    return;
  }

  return getConfigForExtension(packageConfigs, extension);
}

function getConfigForExtension(configs: IConfigByGlobs, extension: string): IConfig | undefined {
  const foundConfigs: Array<IConfig | undefined> = Object.keys(configs).map(joinedGlobs => {
    const globs = joinedGlobs.split(",").map(rawGlob => rawGlob.trim());
    const config = configs[joinedGlobs];

    if (globs.some(glob => minimatch(extension, glob))) {
      return config;
    }
  });

  return mergeConfigs(foundConfigs);
}

function getConfigsFromPackage(directory: string): IConfigByGlobs | undefined {
  try {
    return JSON.parse(readFileSync(`${findRoot(directory)}/package.json`, "utf-8")).importSort;
  } catch (e) {
    return;
  }
}

function mergeConfigs(rawConfigs: Array<IConfig | undefined>): IConfig | undefined {
  const configs = rawConfigs.filter(rawConfig => !!rawConfig) as Array<IConfig>;

  if (configs.length === 0) {
    return;
  }

  return configs.reduce((previousConfig, currentConfig) => {
    if (!currentConfig) {
      return previousConfig;
    }

    const config = assign({}, previousConfig);

    if (currentConfig.parser) {
      config.parser = currentConfig.parser;
    }

    if (currentConfig.style) {
      config.style = currentConfig.style;
    }

    return config!;
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
  if (module.indexOf(".") === 0) {
    return resolveModule(module, directory);
  }

  if (module.indexOf("import-sort-parser") === 0) {
    return resolveModule(module, directory);
  }

  return resolveModule(`import-sort-parser-${module}`, directory);
}

function resolveStyle(module: string, directory?: string) {
  if (module.indexOf(".") === 0) {
    return resolveModule(module, directory);
  }

  if (module.indexOf("import-sort-style-") === 0) {
    return resolveModule(module, directory);
  }

  return resolveModule(`import-sort-style-${module}`, directory);
}

function resolveModule(module: string, directory?: string): string | undefined {
  if (directory) {
    const path = resolve(directory, module);

    if (path) {
      return path;
    }
  }

  const path = resolve(__dirname, module);

  if (path) {
    return path;
  }
}
