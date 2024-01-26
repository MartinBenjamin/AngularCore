using System;

namespace CommonDomainObjects
{
    public static class DomainObjectExtensions
    {
        public static T Cast<T>(
            this DomainObject domainObject
            ) where T: class
            => (T)domainObject?.Object;

        public static T As<T>(
            this DomainObject domainObject
            ) where T: class
            => domainObject?.Object as T;

        public static bool Is<T>(
            this DomainObject domainObject
            ) where T: class
            => domainObject?.Object is T;
    }

    public abstract class DomainObject
    {
        // Suppose type B is a subclass of type A which is a subclass of
        // DomainObject. Suppose an object has a reference of type A to
        // an instance of type B and wishes to cast the reference to a
        // reference of type B. However, instead of an instance of type B,
        // tne ORM component may generate a proxy for the reference to type A
        // (which is a subclass of type A). This proxy is not castable to
        // type B. This method allows the proxy to be bypassed so that down
        // casts can be performed.
        public virtual object Object
            => this;

        public virtual Type GetUnderlyingType()
            => GetType();
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
            object obj
            ) => ReferenceEquals(this, obj) ||
                (obj is DomainObject<TId> domainObject &&
                 GetType() == domainObject.GetUnderlyingType() &&
                 Id.Equals(domainObject.Id) &&
                 !Id.Equals(default(TId)));

        public override int GetHashCode()
            => Id.GetHashCode();

        public override string ToString()
            => string.Format(
                "{0}({1})",
                GetType().Name,
                Id);

        public static bool operator ==(
            DomainObject<TId> lhs,
            DomainObject<TId> rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            DomainObject<TId> lhs,
            DomainObject<TId> rhs
            ) => !(lhs == rhs);
    }
}