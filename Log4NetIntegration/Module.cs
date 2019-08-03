using Autofac.Core;
using log4net;
using System.Linq;

namespace Log4NetIntegration
{
    class Module: Autofac.Module
    {
        protected override void AttachToComponentRegistration(
            IComponentRegistry     componentRegistry,
            IComponentRegistration registration
            )
        {
            registration.Preparing += OnComponentPreparing;
        }

        static void OnComponentPreparing(
            object             sender,
            PreparingEventArgs e
            )
        {
            var t = e.Component.Target.Activator.LimitType;
            e.Parameters = e.Parameters.Union(
                new[]
                {
                    new ResolvedParameter(
                        (p, i) => p.ParameterType == typeof(ILog),
                        (p, i) => LogManager.GetLogger(t))
                });
        }
    }
}
