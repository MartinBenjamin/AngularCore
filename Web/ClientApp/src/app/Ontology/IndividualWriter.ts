import { IIndividualSelector } from "./IIndividualSelector";
import { INamedIndividual } from "./INamedIndividual";

export class IndividualWriter implements IIndividualSelector<string>
{
    NamedIndividual(
        namedIndividual: INamedIndividual
        ): string
    {
        return namedIndividual.Iri;
    }
}
