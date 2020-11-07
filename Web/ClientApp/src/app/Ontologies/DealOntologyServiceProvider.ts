import { InjectionToken, Provider } from "@angular/core";
import { IDealOntologyService } from "./IDealOntologyService";
import { DealOntologyService } from "./DealOntologyService";

export const DealOntologyServiceToken = new InjectionToken<IDealOntologyService>('DealOntologyService');

export const DealOntologyServiceProvider: Provider =
{
    provide: DealOntologyServiceToken,
    useClass: DealOntologyService
};
