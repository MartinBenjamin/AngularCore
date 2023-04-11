using System;

namespace EavStore
{
    public class Decimal: Value
    {
        private decimal _value;

        public Decimal(
            decimal value
            )
        {
            _value = value;
        }

        public override TypeCode GetTypeCode()
        {
            return _value.GetTypeCode();
        }

        public override decimal ToDecimal(IFormatProvider provider) => _value;
    }
}
