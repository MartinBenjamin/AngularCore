using System;

namespace EavStore
{
    public class String: Value
    {
        private string _value;

        public String(
            string value
            )
        {
            _value = value;
        }

        public override TypeCode GetTypeCode() => _value.GetTypeCode();

        public override string ToString(IFormatProvider provider) => _value;

        public static implicit operator String(string value) => new String(value);
    }
}
