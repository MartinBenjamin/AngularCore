import { ObjectIntersectionOf } from '../Ontology/ClassExpression';
import { IClass } from '../Ontology/IClass';
import { IDataPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from "../Ontology/Ontology";
import { Decimal } from "../Ontology/Xsd";

export class Time extends Ontology
{
    Year           : IDataPropertyExpression;
    Month          : IDataPropertyExpression;
    Day            : IDataPropertyExpression;
    DateDescription: IClass;

    constructor()
    {
        super("Time");

        this.Year  = this.DeclareFunctionalDataProperty("Year" );
        this.Month = this.DeclareFunctionalDataProperty("Month");
        this.Day   = this.DeclareFunctionalDataProperty("Day"  );
        this.Year.Range(Decimal);
        this.Month.Range(Decimal);
        this.Day.Range(Decimal);

        this.DateDescription = this.DeclareClass("DateDescription");
        this.DateDescription.Define(new ObjectIntersectionOf([
            this.Year.ExactCardinality(1, Decimal),
            this.Month.ExactCardinality(1, Decimal),
            this.Day.ExactCardinality(1, Decimal)
        ]));
    }
}

export const time = new Time();
