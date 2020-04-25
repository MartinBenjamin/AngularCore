import { Named, Guid, DomainObject } from "./CommonDomainObjects";
import { AutonomousAgent } from "./Agents";

export interface Role extends Named<Guid>
{
}

export interface AutonomousAgentInRole extends DomainObject<Guid>
{
    AutonomousAgent: AutonomousAgent;
    Role           : Role;
}
