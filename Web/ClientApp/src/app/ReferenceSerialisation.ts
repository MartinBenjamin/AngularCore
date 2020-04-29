/// <reference path="Components/Date.d.ts"/>

let dateParser = parseUTCDate('yyyy-MM-ddTHH:mm:ss.SSSZ');

export function newReferenceDeserialiser()
{
    let objectMap = {};
    let deserialiser = function(
        object: any
        )
    {
        if(object == null)
            return object;

        if(typeof object == 'string')
        {
            let date = dateParser(object);
            if(date)
                return date;
        }

        if(typeof object != 'object')
            return object;

        if(Object.prototype.toString.call(object) === '[object Array]')
            return (<Array<any>>object).map(deserialiser);

        if('$ref' in object)
            return objectMap[object.$ref];

        if('$id' in object)
        {
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
    let objects = [];

    let serialiser = function(
        object: any
        )
    {
        if(object == null)
            return object;

        if(Object.prototype.toString.call(object) === '[object Date]')
            return (<Date>object).toISOString();

        if(typeof object != 'object')
            return object;

        if(Object.prototype.toString.call(object) === '[object Array]')
            return (<Array<any>>object).map(serialiser);

        let index = objects.indexOf(object);

        if(index != -1)
            return {
                $ref: String(index + 1)
            };

        objects.push(object);

        let serialised = {
            $id: String(objects.length)
        };

        for(let propertyName in object)
            serialised[propertyName] = serialiser(object[propertyName]);

        return serialised;
    };

    return serialiser;
}
