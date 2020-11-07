import { Injectable } from "@angular/core";
import { advisory } from "./Advisory";
import { IDealOntology } from "./IDealOntology";
import { IDealOntologyService } from "./IDealOntologyService";
import { projectFinance } from "./ProjectFinance";

@Injectable()
export class DealOntologyService implements IDealOntologyService
{
    private static readonly _dealOntologies: IDealOntology[] =
        [
            advisory,
            projectFinance
        ];

    Get(
        iri: string
        ): IDealOntology
    {
        return DealOntologyService._dealOntologies.find(dealOntology => dealOntology.Iri === iri);
    }
}