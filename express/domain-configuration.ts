import _ from 'lodash';
import { DomainConfiguration } from "graph-on-rails";
import YAML from 'yaml';

// you can add object based configuration here

const age = (item:any) => new Date().getFullYear() - item.manufacturedYear;

export const domainConfiguration:DomainConfiguration = {}
