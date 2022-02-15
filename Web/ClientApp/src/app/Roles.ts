import { AutonomousAgent } from "./Agents";
import { Classifier } from "./ClassificationScheme";
import { DomainObject, Guid } from "./CommonDomainObjects";

export interface Role extends Classifier
{
}

export interface AutonomousAgentInRole extends DomainObject<Guid>
{
    AutonomousAgent: AutonomousAgent;
    Role           : Role;
}
