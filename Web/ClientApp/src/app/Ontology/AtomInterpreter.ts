import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from '../EavStore/Atom';
import { IsConstant, IsVariable } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
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
            AtomInterpreter.Filter([property.Domain, property.Range]),
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

    Conjunction<TTerms extends any[]>(atoms: IAtom[], terms: TTerms): Wrapped<T, readonly { [K in keyof TTerms]: any; }[]>;
    Conjunction(atoms: IAtom[]): Wrapped<T, readonly object[]>;
    Conjunction(
        atoms: IAtom[],
        terms?: any[]
        ): Wrapped<T, object[]>
    {
        if(terms)
            return this._wrap(
                AtomInterpreter.Conjunction(terms),
                ...atoms.map(atom => atom.Select(this)));

        return this._wrap(
            AtomInterpreter.Conjunction(),
            ...atoms.map(atom => atom.Select(this)));
    }

    static Filter(
        terms: any[]
        ): (tuples: Iterable<Tuple>) => object[]
    {
        return (tuples: Iterable<Tuple>) =>
        {
            const substitutions: object[] = [];
            for(const tuple of tuples)
            {
                let substitution = {};
                for(let index = 0; index < terms.length && substitution; ++index)
                {
                    const term = terms[index];
                    if(IsConstant(term))
                    {
                        if(term !== tuple[index])
                            substitution = null;
                    }
                    else if(IsVariable(term))
                    {
                        if(substitution[term] === undefined)
                            substitution[term] = tuple[index];

                        else if(substitution[term] !== tuple[index])
                            // Tuple does not match query pattern.
                            substitution = null;
                    }
                }

                if(substitution)
                    substitutions.push(substitution)
            }

            return substitutions;
        };
    }

    static Conjunction(): (...inputs: (object[] | BuiltIn)[]) => object[];
    static Conjunction(terms: any[]): (...inputs: (object[] | BuiltIn)[]) => Tuple[];
    static Conjunction(
        terms?: any[]
        ): (...inputs: (object[] | BuiltIn)[]) => object[]
    {
        let initialSubstitution: object = {};
        let map: (substitutions: object[]) => object[] = substitutions => substitutions;
        if(terms)
            map = substitutions => substitutions.map(substitution => terms.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));

        return (...inputs: (object[] | Function)[]) => map(inputs.reduce<object[]>(
            (substitutions, input) =>
            {
                if(typeof input === 'function')
                    return [...input(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const outer = substitutions.shift();
                    for(const inner of input)
                    {
                        let match = true;
                        for(const variable in inner)
                            if(!(outer[variable] === undefined || outer[variable] === inner[variable]))
                            {
                                match = false;
                                break;
                            }

                        if(match)
                            substitutions.push({ ...outer, ...inner });
                    }
                }

                return substitutions;
            },
            [initialSubstitution]));
    }
}
