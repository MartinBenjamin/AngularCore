import { Guid } from "../CommonDomainObjects";
import { AtomInterpreter } from "../Ontology/AtomInterpreter";
import { IDLSafeRule } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IAxiomSelector } from "../Ontology/IAxiomSelector";
import { IClass } from "../Ontology/IClass";
import { IClassExpressionSelector } from "../Ontology/IClassExpressionSelector";
import { IDataPropertyRange } from "../Ontology/IDataPropertyRange";
import { IDatatype } from "../Ontology/IDatatype";
import { IDataProperty, IObjectProperty } from "../Ontology/IProperty";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { Wrap, Wrapped, WrapperType } from "../Ontology/Wrapped";
import { annotations } from "./Annotations";

const empty = new Set<any>();

export class ContradictionInterpreter<T extends WrapperType> implements IAxiomSelector<Wrapped<T, [IAxiom, Set<any>]>>
{
    constructor(
        private _wrap                      : Wrap<T>,
        private _applicableStages          : Wrapped<T, Set<Guid>>,
        private _classExpressionInterpreter: IClassExpressionSelector<Wrapped<T, Set<any>>>,
        private _atomInterpreter           : AtomInterpreter<T>
        )
    {
    }

    SubclassOf(
        subClassOf: ISubClassOf
        ): Wrapped<T, [ISubClassOf, Set<any>]>
    {
        let restrictedFromStage = subClassOf.Annotations.find(annotation => annotation.Property === annotations.RestrictedfromStage);
        if(!restrictedFromStage)
            return undefined;

        this._wrap(
            (applicableStages, superClass, subClass) =>
            {
                if(!applicableStages.has(restrictedFromStage.Value))
                    return [
                        subClassOf,
                        empty];

                const contradictions = [...subClass].filter(element => !superClass.has(element));
                return [
                    subClassOf,
                    contradictions.length ? new Set<any>(contradictions) : empty];
            },
            this._applicableStages,
            subClassOf.SuperClassExpression.Select(this._classExpressionInterpreter),
            subClassOf.SubClassExpression.Select(this._classExpressionInterpreter));
    }

    DLSafeRule(
        dlSafeRule: IDLSafeRule
        ): Wrapped<T, [IDLSafeRule, Set<any>]>
    {
        let restrictedFromStage = dlSafeRule.Annotations.find(annotation => annotation.Property === annotations.RestrictedfromStage);
        if(!restrictedFromStage)
            return undefined;                

        return this._wrap(
            (applicableStages, head, body) =>
            {
                if(!applicableStages.has(restrictedFromStage.Value))
                    return [
                        dlSafeRule,
                        empty];

                const contradictions = body.reduce<object[]>(
                    (contradictions, x) =>
                    {
                        if(!head.some(y =>
                        {
                            for(const key in x)
                                if(key in y && x[key] !== y[key])
                                    return false;
                            return true;
                        }))
                            contradictions.push(x);

                        return contradictions;
                    },
                    []);

                return [
                    dlSafeRule,
                    contradictions.length ? new Set<any>(contradictions) : empty];

            },
            this._applicableStages,
            this._atomInterpreter.Conjunction(dlSafeRule.Head),
            this._atomInterpreter.Conjunction(dlSafeRule.Body));
    }

    DataPropertyRange(
        dataPropertyRange: IDataPropertyRange
        ): Wrapped<T, [IDataPropertyRange, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    Class(
        class$: IClass
        ): Wrapped<T, [IAxiom, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Wrapped<T, [IAxiom, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Wrapped<T, [IAxiom, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    Datatype(
        datatype: IDatatype
        ): Wrapped<T, [IAxiom, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }
}
