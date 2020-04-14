import { AutonomousAgent } from './Agents';

export interface Organisation extends AutonomousAgent
{
    Acronym: string;
}

export interface OrganisationalSubUnit extends Organisation
{
}

export interface Branch extends OrganisationalSubUnit
{
}
