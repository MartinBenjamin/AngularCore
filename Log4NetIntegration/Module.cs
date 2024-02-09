using Autofac.Core;
using Autofac.Core.Registration;
using Autofac.Core.Resolving.Pipeline;
using log4net;
using System;
using System.Linq;
using System.Reflection;

namespace Log4NetIntegration
{
    public class Log4NetMiddleware: IResolveMiddleware
    {
        PipelinePhase IResolveMiddleware.Phase => PipelinePhase.ParameterSelection;

        void IResolveMiddleware.Execute(
            ResolveRequestContext         context,
            Action<ResolveRequestContext> next
            )
        {
            // Add our parameters.
            context.ChangeParameters(context.Parameters.Union(
                new[]
                {
                    new ResolvedParameter(
                        (p, i) => p.ParameterType == typeof(ILog),
                        (p, i) => LogManager.GetLogger(p.Member.DeclaringType))
                }));

            // Continue the resolve.
            next(context);

            // Has an instance been activated?
            if(context.NewInstanceActivated)
            {
                var instanceType = context.Instance.GetType();

                // Get all the injectable properties to set.
                // If you wanted to ensure the properties were only UNSET properties,
                // here's where you'd do it.
                var properties = instanceType
                    .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.PropertyType == typeof(ILog) && p.CanWrite && p.GetIndexParameters().Length == 0);

                // Set the properties located.
                foreach(var propToSet in properties)
                    propToSet.SetValue(
                        context.Instance,
                        LogManager.GetLogger(instanceType),
                        null);
            }
        }
    }

    public class Module: Autofac.Module
    {
        private readonly IResolveMiddleware _middleware = new Log4NetMiddleware();

        public Module()
        {
        }

        protected override void AttachToComponentRegistration(
            IComponentRegistryBuilder componentRegistryBuilder,
            IComponentRegistration    registration
            )
        {
            // Attach to the registration's pipeline build.
            registration.PipelineBuilding += (sender, pipeline) =>
            {
                // Add our middleware to the pipeline.
                pipeline.Use(_middleware);
            };
        }
    }
}
