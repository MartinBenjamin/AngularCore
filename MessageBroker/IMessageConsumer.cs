using System;
using System.Threading.Tasks;

namespace MessageBroker
{
    public interface IMessageConsumer
    {
        Task Consume(Guid messageId);
    }
}
