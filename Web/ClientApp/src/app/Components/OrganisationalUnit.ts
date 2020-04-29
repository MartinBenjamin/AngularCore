import { Hierarchical } from './Hierarchical';

interface OrganisationalUnitBase
{
    Id      : number;
    Acronym : string;
}

export type OrganisationalUnit = Hierarchical<OrganisationalUnitBase>;
