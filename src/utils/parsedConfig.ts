import yaml from 'js-yaml';
import { join } from 'path';
import { configType } from '../types';
import { readFileSync } from 'fs';
const importYaml = yaml.load(readFileSync(join(__dirname, '..', 'config.yml'), "utf8")) as configType;
export const config = importYaml;
