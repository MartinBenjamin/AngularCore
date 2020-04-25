import { AutonomousAgent } from "./Agents";

export interface Person extends AutonomousAgent
{
    NameComponents: PersonNameComponents
}

export interface PersonNameComponents
{
    Given : string;
    Family: string;
}
