import { DealStageIdentifier } from '../Deals';
import { IClass } from '../Ontology/IClass';
import { IDataPropertyExpression, IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from "../Ontology/Ontology";
import { Decimal } from "../Ontology/Xsd";
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";

export class CurrencyAmount extends Ontology
{
    readonly Currency      : IObjectPropertyExpression;
    readonly Amount        : IDataPropertyExpression;
    readonly MonetaryAmount: IClass;

    constructor()
    {
        super(
            "CurrencyAmount",
            commonDomainObjects,
            annotations);

        this.Currency = this.DeclareFunctionalObjectProperty("Currency");
        this.Amount   = this.DeclareFunctionalDataProperty("Amount");
        this.Amount.Range(Decimal);
        this.MonetaryAmount = this.DeclareClass("MonetaryAmount");

        //this.MonetaryAmount.Define(commonDomainObjects.$type.HasValue('Web.Model.MonetaryAmount, Web'));
        this.MonetaryAmount.SubClassOf(this.Currency.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.MonetaryAmount.SubClassOf(this.Amount.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const currencyAmount = new CurrencyAmount();
