import { IDealOntologyService } from "./IDealOntologyService";
import { IDealOntology } from "./IDealOntology";
import { advisory } from "./Advisory";
import { projectfinance } from "./ProjectFinance";

export class DealOntologyService implements IDealOntologyService
{
    private static readonly _dealOntologies: IDealOntology[] =
        [
            advisory,
            projectfinance
        ];

    Get(
        iri: string
        ): IDealOntology
    {
        return DealOntologyService._dealOntologies.find(dealOntology => dealOntology.Iri === iri);
    }
}
