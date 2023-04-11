using System;

namespace EavStore
{
    public abstract class Value: IConvertible
    {
        public abstract TypeCode GetTypeCode();

        public virtual bool     ToBoolean (IFormatProvider provider) => throw new NotImplementedException();
        public virtual byte     ToByte    (IFormatProvider provider) => throw new NotImplementedException();
        public virtual char     ToChar    (IFormatProvider provider) => throw new NotImplementedException();
        public virtual DateTime ToDateTime(IFormatProvider provider) => throw new NotImplementedException();
        public virtual decimal  ToDecimal (IFormatProvider provider) => throw new NotImplementedException();
        public virtual double   ToDouble  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual short    ToInt16   (IFormatProvider provider) => throw new NotImplementedException();
        public virtual int      ToInt32   (IFormatProvider provider) => throw new NotImplementedException();
        public virtual long     ToInt64   (IFormatProvider provider) => throw new NotImplementedException();
        public virtual sbyte    ToSByte   (IFormatProvider provider) => throw new NotImplementedException();
        public virtual float    ToSingle  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual string   ToString  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual ushort   ToUInt16  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual uint     ToUInt32  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual ulong    ToUInt64  (IFormatProvider provider) => throw new NotImplementedException();
        public virtual object   ToType    (Type conversionType, IFormatProvider provider) =>  throw new NotImplementedException();

        public static implicit operator Value(sbyte   value) => new SByte  (value);
        public static implicit operator Value(short   value) => new Int16  (value);
        public static implicit operator Value(int     value) => new Int32  (value);
        public static implicit operator Value(long    value) => new Int64  (value);
        public static implicit operator Value(decimal value) => new Decimal(value);
    }
}
