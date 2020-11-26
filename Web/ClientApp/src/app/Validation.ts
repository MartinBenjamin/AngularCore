import { Deal } from "./Deals";

export interface IObjectValidator
{
    Properties?: IProperty[];
    Validate  ?: (object: object, errors: Map<object, Map<string, string[]>>) => boolean;
}

export interface IProperty
{
    Name            : string;
    Validators     ?: IPropertyValidator[];
    ObjectValidator?: IObjectValidator;
}

export interface IDataProperty extends IProperty
{
}

export interface IPropertyValidator
{
    ErrorMessage: string;

    Validate(
        value   : any,
        object  : object,
        property: string): boolean;
}

export let NumberValidator: IPropertyValidator =
{
    ErrorMessage: 'Invalid.',
    Validate(
        value: any
        ): boolean
    {
        return value === null || (typeof value === 'number' && !isNaN(value));
    }
};

export let DateValidator: IPropertyValidator =
{
    ErrorMessage: 'Invalid.',
    Validate(
        value: any
        ): boolean
    {
        return value === null || value instanceof Date;
    }
};

export let Mandatory: IPropertyValidator =
{
    ErrorMessage: 'Mandatory.',
    Validate(
        value: any
        ): boolean
    {
        if(Array.isArray(value))
            (<Array<any>>value).length;

        if(typeof value === 'string')
            return (<string>value).length > 0;

        return value !== null;
    }
};

export function Validate(
    objectValidator: IObjectValidator,
    errors         : Map<object, Map<string, string[]>>,
    object         : object
    ): boolean
{
        let valid = true;
        objectValidator.Properties.forEach(
            property =>
            {
                let value = object[property.Name];
                if(property.ObjectValidator)
                    if(Array.isArray(value))
                        value.forEach(
                            childObject => valid = valid && Validate(
                                property.ObjectValidator,
                                errors,
                                childObject));
                    else
                        valid = valid && Validate(
                            property.ObjectValidator,
                            errors,
                            value);

                if(valid)
                    property.Validators.forEach(
                        propertyValidator =>
                        {
                            if(!propertyValidator.Validate(
                                value,
                                object,
                                property.Name))
                            {
                                valid = false;
                                let objectErrors = errors.get(object);
                                if(!objectErrors)
                                {
                                    objectErrors = new Map<string, string[]>();
                                    errors.set(
                                        object,
                                        objectErrors);
                                }

                                let propertyErrors = objectErrors.get(property.Name);
                                if(!propertyErrors)
                                {
                                    propertyErrors = [];
                                    objectErrors.set(
                                        property.Name,
                                        propertyErrors);
                                }

                                propertyErrors.push(propertyValidator.ErrorMessage);
                            }
                        });
            });

    if(valid && objectValidator.Validate)
        valid = objectValidator.Validate(
            object,
            errors);

    return valid;
}

export interface ObjectValidator<T>
{
    Properties: {
        [key in keyof T]?: Property<T[key]>
    }
}

export interface Property<T>
{

}

export interface PropertyValidator<T>
{
    Validate(t: T): void;
}


let x: ObjectValidator<Deal> = {
    Properties: {
        Parties: {},
        
        
    }
};
