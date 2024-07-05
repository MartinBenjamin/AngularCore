using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public class SynchronisationService: ISynchronisationService
    {
        private readonly IDictionary<ITuple, Synchronisation> _synchronisations = new Dictionary<ITuple, Synchronisation>();

        Synchronisation ISynchronisationService.Resolve(
            ITuple channel
            )
        {
            if(!_synchronisations.TryGetValue(
                channel,
                out var synchronisation))
            {
                synchronisation = new Synchronisation(channel);
                _synchronisations[channel] = synchronisation;

            }
            return synchronisation;
        }
    }
}
