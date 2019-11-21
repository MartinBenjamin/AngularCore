using Agents;
using System;

namespace People
{
    public class Person: AutonomousAgent
    {
        new public virtual PersonName Name { get; protected set; }

        protected Person() : base()
        {
        }

        public Person(
            Guid       id,
            PersonName name
            ) : base(
                id,
                name.Full)
        {
            Name = name;
        }

        public Person(
            PersonName name
            ) : this(
                Guid.NewGuid(),
                name)
        {
        }
    }

    public class PersonName
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

        protected PersonName()
        {
        }

        public PersonName(
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
