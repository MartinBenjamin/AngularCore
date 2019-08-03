using System;

namespace CommonDomainObjects
{
    public static class DomainObjectExtensions
    {
        public static T Cast<T>(
            this DomainObject domainObject
            ) where T: class
        {
            return (T)domainObject.Object;
        }

        public static T As<T>(
            this DomainObject domainObject
            ) where T: class
        {
            return domainObject.Object as T;
        }

        public static bool Is<T>(
            this DomainObject domainObject
            ) where T: class
        {
            return domainObject.Object is T;
        }
    }

    public abstract class DomainObject
    {
        public virtual object Object
        {
            get
            {
                // Suppose type B is a subclass of type A which is a subclass of
                // DomainObject. Suppose an object has a reference of type A to
                // an instance of type B and wishes to cast the reference to a
                // reference of type B. However, instead of an instance of type B,
                // tne ORM component may generate a proxy for the reference to type A
                // (which is a subclass of type A). This proxy is not castable to
                // type B. This method allows the proxy to be bypassed so that down
                // casts can be performed.
                return this;
            }
        }

        public virtual Type GetUnderlyingType()
        {
            return GetType();
        }
    }

    public abstract class DomainObject<TId>: DomainObject
    {
        public virtual TId Id { get; protected set; }

        protected DomainObject()
        {
        }

        protected DomainObject(
            TId id
            )
        {
            Id = id;
        }

        public override bool Equals(
            object o
            )
        {
            var domainObject = o as DomainObject<TId>;

            return
                ReferenceEquals(this, domainObject) ||
                (domainObject != null &&
                 GetType() == domainObject.GetUnderlyingType() &&
                 Id.Equals(domainObject.Id) &&
                 !Id.Equals(default(TId)));
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }

        public override string ToString()
        {
            return string.Format(
                "{0}({1})",
                GetType().Name,
                Id);
        }

        public static bool operator ==(
            DomainObject<TId> lhs,
            DomainObject<TId> rhs
            )
        {
            return Equals(
                lhs,
                rhs);
        }

        public static bool operator !=(
            DomainObject<TId> lhs,
            DomainObject<TId> rhs
            )
        {
            return !(lhs == rhs);
        }
    }
}