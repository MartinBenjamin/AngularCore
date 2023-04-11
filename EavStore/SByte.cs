using System;

namespace EavStore
{
    public class SByte: Value
    {
        private sbyte _value;

        public SByte(
            sbyte value
            )
        {
            _value = value;
        }

        public override TypeCode GetTypeCode() => _value.GetTypeCode();

        public override sbyte   ToSByte  (IFormatProvider provider) => _value;
        public override short   ToInt16  (IFormatProvider provider) => _value;
        public override int     ToInt32  (IFormatProvider provider) => _value;
        public override long    ToInt64  (IFormatProvider provider) => _value;
        public override decimal ToDecimal(IFormatProvider provider) => _value;
    }
}
