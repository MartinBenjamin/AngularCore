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

export function Sort<TPartyInRole extends PartyInRole>(
    x: TPartyInRole,
    y: TPartyInRole
    ): number
{
    const xName = x.Organisation.Name;
    const yName = y.Organisation.Name;

    if(xName == yName)
        return 0;

    return xName < yName ? -1 : 1;

}
