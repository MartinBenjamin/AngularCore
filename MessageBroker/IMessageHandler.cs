using System;
using System.Threading.Tasks;

namespace MessageBroker
{
    public interface IMessageHandler
    {
        Type Type { get; }

        Task Handle(
            IMessageBroker broker,
            Message        message);
    }
}
