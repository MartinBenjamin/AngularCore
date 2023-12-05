import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from '../EavStore/Atom';
import { EavStore } from '../EavStore/EavStore';
import { IsConstant, IsVariable } from '../EavStore/IEavStore';
import { ClassExpressionInterpreter } from './ClassExpressionInterpreter';
import { IAtom, IAtomSelector, IClassAtom, IDataPropertyAtom, IDataRangeAtom, IEqualAtom, IGreaterThanAtom, IGreaterThanOrEqualAtom, ILessThanAtom, ILessThanOrEqualAtom, INotEqualAtom, IObjectPropertyAtom, IPropertyAtom } from './DLSafeRule';
import { PropertyExpressionInterpreter } from './PropertyExpressionInterpreter';
import { Wrap, Wrapped, WrapperType } from './Wrapped';

export class AtomInterpreter<T extends WrapperType> implements IAtomSelector<Wrapped<T, object[] | BuiltIn>>
{
    constructor(
        protected _wrap                         : Wrap<T>,
        private   _propertyExpressionInterpreter: PropertyExpressionInterpreter<T>,
        private   _classExpressionInterpreter   : ClassExpressionInterpreter<T>
        )
    {
        _propertyExpressionInterpreter.AtomInterpreter = this;
    }

    Class(
        class$: IClassAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        if(IsVariable(class$.Individual))
            return this._wrap(
                individuals => [...individuals].map(
                    individual =>
                    {
                        return { [<string>class$.Individual]: individual };
                    }),
                class$.ClassExpression.Select(this._classExpressionInterpreter));

        return this._wrap(
            individuals => individuals.has(class$.Individual) ? [{}] : [],
            class$.ClassExpression.Select(this._classExpressionInterpreter));
    }

    DataRange(
        dataRange: IDataRangeAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => (
            substitutions: Iterable<object>
            ) =>
        {
            if(IsConstant(dataRange.Value))
                return dataRange.DataRange.HasMember(dataRange.Value) ? substitutions : [];

            return [...substitutions].filter(substitution => dataRange.DataRange.HasMember(substitution[dataRange.Value]));
        });
    }

    ObjectProperty(
        objectProperty: IObjectPropertyAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataPropertyAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IPropertyAtom
        ): Wrapped<T, object[]>
    {
        return this._wrap(
            EavStore.Filter([property.Domain, property.Range]),
            property.PropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    LessThan(
        lessThan: ILessThanAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => LessThan(lessThan.Lhs, lessThan.Rhs));
    }

    LessThanOrEqual(
        lessThanOrEqual: ILessThanOrEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => LessThanOrEqual(lessThanOrEqual.Lhs, lessThanOrEqual.Rhs));
    }

    Equal(
        equal: IEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => Equal(equal.Lhs, equal.Rhs));
    }

    NotEqual(
        notEqual: INotEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(()=> NotEqual(notEqual.Lhs, notEqual.Rhs));
    }

    GreaterThanOrEqual(
        greaterThanOrEqual: IGreaterThanOrEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => GreaterThanOrEqual(greaterThanOrEqual.Lhs, greaterThanOrEqual.Rhs));
    }

    GreaterThan(
        greaterThan: IGreaterThanAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => GreaterThan(greaterThan.Lhs, greaterThan.Rhs));
    }

    Conjunction(atoms: IAtom[], terms: any[]): Wrapped<T, any[][]>;
    Conjunction(atoms: IAtom[]): Wrapped<T, object[]>;
    Conjunction(
        atoms: IAtom[],
        terms?: any[]
        ): Wrapped<T, object[]>
    {
        if(terms)
            return this._wrap(
                EavStore.Conjunction(terms),
                ...atoms.map(atom => atom.Select(this)));

        return this._wrap(
            EavStore.Conjunction(),
            ...atoms.map(atom => atom.Select(this)));
    }
}
