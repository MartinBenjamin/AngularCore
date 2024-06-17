using Process.Expression;
using System;

namespace Process.Definition
{
    public class Channel
    {
        public string Name { get; protected set; }
        public Type   Type { get; protected set; }

        public Channel(
            string name,
            Type   type = null
            )
        {
            Name = name;
            Type = type;
        }

        public override bool Equals(
            object obj
            ) =>
            obj is Channel channel &&
            Name == channel.Name &&
            Type == channel.Type;

        public override int GetHashCode() => HashCode.Combine(
            Name,
            Type);

        public override string ToString() => Name;

        public static implicit operator Func<IScope, Channel>(
            Channel channel
            ) => _ => channel;
    }
}
