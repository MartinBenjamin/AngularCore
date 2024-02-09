import { parseUTCDate } from "./Components/Date";

let dateParser = parseUTCDate('yyyy-MM-ddTHH:mm:ss.SSSZ');

export function newReferenceDeserialiser()
{
    let objectMap: { [key: string]: object } = {};
    let deserialiser = function(
        object: any
        ): any
    {
        if(object === null)
            return object;

        if(typeof object === 'string')
        {
            let date = dateParser(object);
            if(date)
                return date;
        }

        if(typeof object !== 'object')
            return object;

        if(Array.isArray(object))
            return object.map(deserialiser);

        if('$ref' in object)
            return objectMap[object.$ref];

        if('$id' in object)
        {
            if('$values' in object)
            {
                objectMap[object.$id] = object.$values;
                object.$values.forEach((element, index, array) => array[index] = deserialiser(element));
                return object.$values;
            }
            objectMap[object.$id] = object;
            delete object.$id;
        }

        for(let propertyName in object)
            object[propertyName] = deserialiser(object[propertyName])

        return object;
    };

    return deserialiser;
}

export function newReferenceSerialiser()
{
    let objects: object[] = [];

    let serialiser = function(
        object: any
        ): any
    {
        if(object === null)
            return object;

        if(object instanceof Date)
            return object.toISOString();

        if(typeof object !== 'object')
            return object;

        if(Array.isArray(object))
            return object.map(serialiser);

        let index = objects.indexOf(object);

        if(index !== -1)
            return {
                $ref: String(index + 1)
            };

        objects.push(object);

        let serialised: { [key: string]: any } = {
            $id: String(objects.length)
        };

        for(let propertyName in object)
            serialised[propertyName] = serialiser(object[propertyName]);

        return serialised;
    };

    return serialiser;
}
