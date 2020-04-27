import { AutonomousAgentInRole } from "./Roles";
import { Person } from "./People";
import { Organisation } from "./Organisations";
import { Range } from './CommonDomainObjects';

export interface PartyInRole extends AutonomousAgentInRole
{
    // A Party is a Person or an Organisation but not both.
    Person      : Person;
    Organisation: Organisation;
    Period      : Range<Date>;
}
