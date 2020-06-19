using CommonDomainObjects;
using System;

namespace Deals
{
    public class DealClass: DomainObject
    {
        public Deal                 Deal                 { get; protected set; }
        public ClassificationScheme ClassificationScheme { get; protected set; }
        public Class                Class                { get; protected set; }

        protected DealClass() : base()
        {
        }

        public DealClass(
            Deal                 deal,
            ClassificationScheme classificationScheme,
            Class                @class
            ) : base()
        {
            Deal                 = deal;
            ClassificationScheme = classificationScheme;
            Class                = @class;
            Deal.Classes.Add(this);
        }

        public override bool Equals(
            object obj
            ) => obj is DealClass dealClass &&
                Deal                 == dealClass.Deal &&
                ClassificationScheme == dealClass.ClassificationScheme &&
                Class                == dealClass.Class;

        public override int GetHashCode()
        {
            return HashCode.Combine(
                ClassificationScheme,
                Class);
        }

        public static bool operator ==(
            DealClass lhs,
            DealClass rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            DealClass lhs,
            DealClass rhs
            ) => !(lhs == rhs);
    }
}
