import { Count } from "../EavStore/Aggregation";
import { BuiltIn, GreaterThan, GreaterThanOrEqual } from "../EavStore/BuiltIn";
import { Not, Rule, Variable } from "../EavStore/Datalog";
import { EntityId } from "../EavStore/EavStore";
import { ClassExpressionWriter } from "./ClassExpressionWriter";
import { DataRange } from "./DataRange";
import { DataRangeWriter } from "./DataRangeWriter";
import { IClass } from "./IClass";
import { IClassExpressionSelector } from "./IClassExpressionSelector";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataCardinality, IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IIndividual } from "./IIndividual";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";
import { Thing } from './Thing';

export type ClassAtom = [string, any];


class PredicateSymbolGenerator implements IClassExpressionSelector<string>
{
    private _next = 0;

    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): string { return this.NextPredicateSymbol(); }
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): string { return this.NextPredicateSymbol(); }
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): string { return this.NextPredicateSymbol(); }
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): string { return this.NextPredicateSymbol(); }
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): string { return this.NextPredicateSymbol(); }
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): string { return this.NextPredicateSymbol(); }
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): string { return this.NextPredicateSymbol(); }
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): string { return this.NextPredicateSymbol(); }
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): string { return this.NextPredicateSymbol(); }
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): string { return this.NextPredicateSymbol(); }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): string { return this.NextPredicateSymbol(); }
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): string { return this.NextPredicateSymbol(); }
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): string { return this.NextPredicateSymbol(); }
    DataHasValue          (dataHasValue          : IDataHasValue          ): string { return this.NextPredicateSymbol(); }
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): string { return this.NextPredicateSymbol(); }
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): string { return this.NextPredicateSymbol(); }
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): string { return this.NextPredicateSymbol(); }
    Class                 (class$                : IClass                 ): string { return class$.Iri;                 }

    private NextPredicateSymbol(): string
    {
        return "ce" + this._next++;
    }
}

export class ClassExpressionInterpreter implements IClassExpressionSelector<string>
{
    private readonly _predicateSymbolSelector: IClassExpressionSelector<string> = new ClassExpressionWriter();//PredicateSymbolGenerator();
    private readonly _dataRangeWriter: IDataRangeSelector<string> = new DataRangeWriter();

    constructor(
        private readonly _propertyExpressionInterpreter: IPropertyExpressionSelector<string>,
        private readonly _individualInterpretation: ReadonlyMap<IIndividual, any>,
        private readonly _rules: Rule[]
        )
    {
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): string
    {
        const predicateSymbol = objectIntersectionOf.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], objectIntersectionOf.ClassExpressions.map(classExpression => [classExpression.Select(this), '?x'])]);
        return predicateSymbol;
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): string
    {
        const predicateSymbol = objectUnionOf.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push(...objectUnionOf.ClassExpressions.map(classExpression => <Rule>[[predicateSymbol, '?x'], [[classExpression.Select(this), '?x']]]));
        return predicateSymbol;
    }

    ObjectComplementOf(objectComplementOf: IObjectComplementOf): string {
        throw new Error("Method not implemented.");
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): string
    {
        const predicateSymbol = objectOneOf.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push(...objectOneOf.Individuals.map(individual => <Rule>[[predicateSymbol, this._individualInterpretation.get(individual)], []]));
        return predicateSymbol;
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): string
    {
        const predicateSymbol = objectSomeValuesFrom.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[objectSomeValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], [objectSomeValuesFrom.ClassExpression.Select(this), '?y']]]);
        return predicateSymbol;
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): string
    {
        const predicateSymbol = objectAllValuesFrom.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'],
                [[Thing.Select(this), '?x'], Not([objectAllValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], Not([objectAllValuesFrom.ClassExpression.Select(this), '?y']))]]);
        return predicateSymbol;
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): string
    {
        const predicateSymbol = objectHasValue.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', this._individualInterpretation.get(objectHasValue.Individual)]]]);
        return predicateSymbol;
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): string
    {
        const predicateSymbol = objectHasSelf.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[objectHasSelf.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?x']]]);
        return predicateSymbol;
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): string
    {
        if(objectMinCardinality.Cardinality === 0)
            return Thing.Select(this);

        const predicateSymbol = objectMinCardinality.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[this.ObjectCardinality(objectMinCardinality), '?x', '?cardinality'], GreaterThanOrEqual('?cardinality', objectMinCardinality.Cardinality)]]);
        return predicateSymbol;
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): string
    {
        const predicateSymbol = objectMaxCardinality.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[Thing.Select(this), '?x'], Not([this.ObjectCardinality(objectMaxCardinality), '?x', '?cardinality'], GreaterThan('?cardinality', objectMaxCardinality.Cardinality))]]);
        return predicateSymbol;
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): string
    {
        const predicateSymbol = objectExactCardinality.Select(this._predicateSymbolSelector);
        if(this._rules.find(rule => rule[0][0] == predicateSymbol))
            return predicateSymbol;

        if(objectExactCardinality.Cardinality === 0)
            this._rules.push([[predicateSymbol, '?x'], [[Thing.Select(this), '?x'], Not([this.ObjectCardinality(objectExactCardinality), '?x', '?cardinality'])]]);

        else
            this._rules.push([[predicateSymbol, '?x'], [[this.ObjectCardinality(objectExactCardinality), '?x', objectExactCardinality.Cardinality]]]);

        return predicateSymbol;
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): string
    {
        const predicateSymbol = dataSomeValuesFrom.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[dataSomeValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], this.HasMember(dataSomeValuesFrom.DataRange, '?y')]]);
        return predicateSymbol;
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): string
    {
        const predicateSymbol = dataAllValuesFrom.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'],
            [[Thing.Select(this), '?x'], Not([dataAllValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], this.NotHasMember(dataAllValuesFrom.DataRange, '?y'))]]);
        return predicateSymbol;
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): string
    {
        const predicateSymbol = dataHasValue.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', dataHasValue.Value]]]);
        return predicateSymbol;
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): string
    {
        if(dataMinCardinality.Cardinality === 0)
            return Thing.Select(this);

        const predicateSymbol = dataMinCardinality.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[this.DataCardinality(dataMinCardinality), '?x', '?cardinality'], GreaterThanOrEqual('?cardinality', dataMinCardinality.Cardinality)]]);
        return predicateSymbol;
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): string
    {
        const predicateSymbol = dataMaxCardinality.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x'], [[Thing.Select(this), '?x'], Not([this.DataCardinality(dataMaxCardinality), '?x', '?cardinality'], GreaterThan('?cardinality', dataMaxCardinality.Cardinality))]]);
        return predicateSymbol;
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): string
    {
        const predicateSymbol = dataExactCardinality.Select(this._predicateSymbolSelector);
        if(this._rules.find(rule => rule[0][0] == predicateSymbol))
            return predicateSymbol;

        if(dataExactCardinality.Cardinality === 0)
            this._rules.push([[predicateSymbol, '?x'], [[Thing.Select(this), '?x'], Not([this.DataCardinality(dataExactCardinality), '?x', '?cardinality'])]]);

        else
            this._rules.push([[predicateSymbol, '?x'], [[this.DataCardinality(dataExactCardinality), '?x', dataExactCardinality.Cardinality]]]);

        return predicateSymbol;
    }

    Class(
        class$: IClass
        ): string
    {
        if(class$ === Thing)
        {
            if(!this._rules.find(rule => rule[0][0] == Thing.Iri))
                this._rules.push([[Thing.Iri, '?x'], [['?x', EntityId,]]]);
        }
        return class$.Select(this._predicateSymbolSelector);
    }

    private ObjectCardinality(
        objectCardinality: IObjectCardinality
        ): string
    {
        const propertyPredicateSymbol = objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        let cePredicateSymbol;
        if(objectCardinality.ClassExpression)
            cePredicateSymbol = objectCardinality.ClassExpression.Select(this);

        let predicateSymbol = `ObjectCardinality(${propertyPredicateSymbol}${cePredicateSymbol ? ' ' + cePredicateSymbol : ''})`;

        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
        {
            const rule: Rule = [[predicateSymbol, '?x', Count()], [[propertyPredicateSymbol, '?x', '?y']]];
            if(cePredicateSymbol)
                rule[1].push([cePredicateSymbol, '?y']);
            this._rules.push(rule);
        }

        return predicateSymbol;
    }

    private DataCardinality(
        dataCardinality: IDataCardinality
        ): string
    {
        const propertyPredicateSymbol = dataCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        let drPredicateSymbol;
        if(dataCardinality.DataRange)
            drPredicateSymbol = dataCardinality.DataRange.Select(this._dataRangeWriter);

        let predicateSymbol = `DataCardinality(${propertyPredicateSymbol}${drPredicateSymbol ? ' ' + drPredicateSymbol : ''})`

        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
        {
            const rule: Rule = [[predicateSymbol, '?x', Count()], [[propertyPredicateSymbol, '?x', '?y']]];
            if(dataCardinality.DataRange)
                rule[1].push(this.HasMember(dataCardinality.DataRange, '?y'))
            this._rules.push(rule);
        }

        return predicateSymbol;
    }

    private HasMember(
        dataRange: DataRange,
        variable: Variable
        ): BuiltIn
    {
        return function*(
            substitutions: Iterable<object>
            )
        {
            for(const substitution of substitutions)
                if(dataRange.HasMember(substitution[variable]))
                    yield substitution;
        };
    }

    private NotHasMember(
        dataRange: DataRange,
        variable: Variable
        ): BuiltIn
    {
        return function*(
            substitutions: Iterable<object>
            )
        {
            for(const substitution of substitutions)
                if(!dataRange.HasMember(substitution[variable]))
                    yield substitution;
        };
    }
}
