using Agents;
using System;

namespace People
{
    public class Person: AutonomousAgent
    {
        new public virtual PersonNameComponents NameComponents { get; protected set; }

        protected Person() : base()
        {
        }

        public Person(
            Guid                 id,
            PersonNameComponents nameComponents
            ) : base(
                id,
                nameComponents.Full)
        {
            NameComponents = nameComponents;
        }

        public Person(
            PersonNameComponents name
            ) : this(
                Guid.NewGuid(),
                name)
        {
        }
    }

    public class PersonNameComponents
    {
        public virtual string Given  { get; protected set; }
        public virtual string Family { get; protected set; }

        public virtual string First
        {
            get
            {
                return Given;
            }
        }

        public virtual string Last
        {
            get
            {
                return Family;
            }
        }

        public virtual string Surname
        {
            get
            {
                return Family;
            }
        }

        public virtual string Full
        {
            get
            {
                return string.Format(
                    "{0} {1}",
                    Given,
                    Family);
            }
        }

        protected PersonNameComponents()
        {
        }

        public PersonNameComponents(
            string givenName,
            string familyName
            )
        {
            Given  = givenName;
            Family = familyName;
        }

        public override string ToString()
        {
            return Full;
        }
    }
}
