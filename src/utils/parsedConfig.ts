import yaml from 'js-yaml';
import { join } from 'path';
import { configType } from '../types';
const importYaml = yaml.load(join(__dirname, '..', 'config.yml')) as configType;
export const config = importYaml;
