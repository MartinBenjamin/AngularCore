using System;

namespace EavStore
{
    public class Entity: Value
    {
        private long _id;

        public Entity(
            long id
            )
        {
            _id = id;
        }

        public override TypeCode GetTypeCode() => TypeCode.Object;

        public static implicit operator Entity(long value) => new Entity(value);
    }
}
