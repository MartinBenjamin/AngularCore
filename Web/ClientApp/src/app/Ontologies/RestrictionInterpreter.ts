import { Guid } from "../CommonDomainObjects";
import { IDLSafeRule } from "../Ontology/DLSafeRule";
import { IAxiomSelector } from "../Ontology/IAxiomSelector";
import { IClass } from "../Ontology/IClass";
import { IClassExpressionSelector } from "../Ontology/IClassExpressionSelector";
import { IDatatype } from "../Ontology/IDatatype";
import { IOntology } from "../Ontology/IOntology";
import { IDataProperty, IObjectProperty } from "../Ontology/IProperty";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { PropertyNameSelector } from "../Ontology/PropertyNameSelector";
import { Wrapped, WrapperType } from "../Ontology/Wrapped";
import { annotations } from "./Annotations";

const empty = new Set<any>();

export abstract class RestrictionInterpreter<T extends WrapperType> implements IAxiomSelector<Wrapped<T, [string, Error, Set<any>]>>
{
    protected abstract Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: { [Parameter in keyof TIn]: Wrapped<T, TIn[Parameter]>; }): Wrapped<T, TOut>;

    constructor(
        private _ontology: IOntology,
        private _applicableStages: Wrapped<T, Set<Guid>>,
        private _classExpressionInterpreter: IClassExpressionSelector<Wrapped<T, Set<any>>>
        )
    {
    }

    SubclassOf(
        subClassOf: ISubClassOf
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        let restrictedFromStage = subClassOf.Annotations.find(annotation => annotation.Property === annotations.RestrictedfromStage);
        if(!restrictedFromStage)
            return undefined;                

        let propertyName;
        for(let annotationAnnotation of restrictedFromStage.Annotations)
            if(annotationAnnotation.Property === annotations.NominalProperty)
            {
                propertyName = annotationAnnotation.Value;
                break;
            }

        if(!propertyName && this._ontology.IsClassExpression.IPropertyRestriction(subClassOf.SuperClassExpression))
            propertyName = subClassOf.SuperClassExpression.PropertyExpression.Select(PropertyNameSelector);

        let errorAnnotation = restrictedFromStage.Annotations.find(annotation => annotation.Property === annotations.Error);
        let error = errorAnnotation ? errorAnnotation.Value : "Mandatory";

        this.Wrap(
            (applicableStages, superClass, subClass) =>
            {
                if(!applicableStages.has(restrictedFromStage.Value))
                    return empty;


                const contradictions = [...subClass].filter(element => !superClass.has(element));
                return [
                    propertyName,
                    error,
                    contradictions.length ? new Set<any>(contradictions) : empty];
            },
            this._applicableStages,
            subClassOf.SuperClassExpression.Select(this._classExpressionInterpreter),
            subClassOf.SubClassExpression.Select(this._classExpressionInterpreter));
    }

    DLSafeRule(
        dlSafeRule: IDLSafeRule
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    Class(
        class$: IClass
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }

    Datatype(
        datatype: IDatatype
        ): Wrapped<T, [string, Error, Set<any>]>
    {
        throw new Error("Method not implemented.");
    }
}
