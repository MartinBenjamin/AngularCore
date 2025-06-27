import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual } from "../EavStore/BuiltIn";
import { Idb, IsVariable } from '../EavStore/Datalog';
import { IAtomSelector, IClassAtom, IDataPropertyAtom, IDataRangeAtom, IEqualAtom, IGreaterThanAtom, IGreaterThanOrEqualAtom, ILessThanAtom, ILessThanOrEqualAtom, INotEqualAtom, IObjectPropertyAtom } from './DLSafeRule';
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IIndividual } from './IIndividual';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';

export class AtomInterpreter implements IAtomSelector<Idb | BuiltIn>
{
    constructor(
        private readonly _classExpressionInterpreter   : IClassExpressionSelector<string>,
        private readonly _propertyExpressionInterpreter: IPropertyExpressionSelector<string>,
        private readonly _individualInterpretation     : ReadonlyMap<IIndividual, any>
        )
    {
    }

    Class(
        class$: IClassAtom
        ): BuiltIn | Idb
    {
        const predicateSymbol = class$.ClassExpression.Select(this._classExpressionInterpreter);

        return IsVariable(class$.Individual) ?
            [predicateSymbol, class$.Individual] :
            [predicateSymbol, this._individualInterpretation.get(class$.Individual)];
    }

    DataRange(
        dataRange: IDataRangeAtom
        ): BuiltIn | Idb
    {
        if(IsVariable(dataRange.Value))
            return function*(
                substitutions: Iterable<object>
                ): Generator<object>
            {
                for(const substitution of substitutions)
                    if(dataRange.DataRange.HasMember(substitution[dataRange.Value]))
                        yield substitution;
            };

        else if(dataRange.DataRange.HasMember(dataRange.Value))
            return function(
                substitutions: Iterable<object>
                )
            {
                return substitutions;
            };

        else
            return function(
                substitutions: Iterable<object>
                )
            {
                return [];
            }
    }

    ObjectProperty(
        objectProperty: IObjectPropertyAtom
        ): BuiltIn | Idb
    {
        const predicateSymbol = objectProperty.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        const domain = IsVariable(objectProperty.Domain) ? objectProperty.Domain : this._individualInterpretation.get(objectProperty.Domain);
        const range  = IsVariable(objectProperty.Range ) ? objectProperty.Range  : this._individualInterpretation.get(objectProperty.Range );
        return [predicateSymbol, domain, range];
    }

    DataProperty(
        dataProperty: IDataPropertyAtom
        ): BuiltIn | Idb
    {
        const predicateSymbol = dataProperty.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        const domain = IsVariable(dataProperty.Domain) ? dataProperty.Domain : this._individualInterpretation.get(dataProperty.Domain);
        return [predicateSymbol, domain, dataProperty.Range];
    }

    LessThan(
        lessThan: ILessThanAtom
        ): BuiltIn | Idb
    {
        return LessThan(lessThan.Lhs, lessThan.Rhs);
    }

    LessThanOrEqual(
        lessThanOrEqual: ILessThanOrEqualAtom
        ): BuiltIn | Idb
    {
        return LessThanOrEqual(lessThanOrEqual.Lhs, lessThanOrEqual.Rhs);
    }

    Equal(
        equal: IEqualAtom
        ): BuiltIn | Idb
    {
        return Equal(equal.Lhs, equal.Rhs);
    }

    NotEqual(
        notEqual: INotEqualAtom
        ): BuiltIn | Idb
    {
        return NotEqual(notEqual.Lhs, notEqual.Rhs);
    }

    GreaterThanOrEqual(
        greaterThanOrEqual: IGreaterThanOrEqualAtom
        ): BuiltIn | Idb
    {
        return GreaterThanOrEqual(greaterThanOrEqual.Lhs, greaterThanOrEqual.Rhs);
    }

    GreaterThan(
        greaterThan: IGreaterThanAtom
        ): BuiltIn | Idb
    {
        return GreaterThan(greaterThan.Lhs, greaterThan.Rhs);
    }
}
