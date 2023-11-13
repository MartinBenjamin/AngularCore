import { IClassExpressionSelector } from '../Ontology/IClassExpressionSelector';
import { ISubClassOf } from '../Ontology/ISubClassOf';
import { Wrap, Wrapped, WrapperType } from '../Ontology/Wrapped';

const empty = new Set<any>();

export function SubClassOfContradictionInterpreter<T extends WrapperType>(
    wrap                      : Wrap<T>,
    classExpressionInterpreter: IClassExpressionSelector<Wrapped<T, Set<any>>>
    ): (subclassOf: ISubClassOf) => Wrapped<T, Set<any>>
{
    return (subclassOf: ISubClassOf) => wrap(
        (superClass, subClass) => 
        {
            const contradictions = [...subClass].filter(element => !superClass.has(element));
            return contradictions.length ? new Set<any>(contradictions) : empty;
        },
        subclassOf.SuperClassExpression.Select(classExpressionInterpreter),
        subclassOf.SubClassExpression.Select(classExpressionInterpreter));
}
