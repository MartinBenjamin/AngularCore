import { Patterns } from './Patterns';
import { Range } from './Range';

export interface NumberInputDefinition
{
    Patterns: Patterns,
    Range   : Range<number>
}