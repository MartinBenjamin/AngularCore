using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NHibernateIntegration;
using System;
using System.IO;

namespace Web
{
    public class Startup
    {
        public IConfiguration      Configuration        { get; }
        public IHostingEnvironment HostingEnvironment   { get; }

        public IContainer          ApplicationContainer { get; private set; }

        public Startup(
            IConfiguration      configuration,
            IHostingEnvironment hostingEnvironment
            )
        {
            Configuration      = configuration;
            HostingEnvironment = hostingEnvironment;
        }

        public IServiceProvider ConfigureServices(
            IServiceCollection services
            )
        {
            // Add services to the collection.
            services.AddMvc();

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(
                configuration =>
                {
                    configuration.RootPath = "ClientApp/dist";
                });

            // Create the container builder.
            var builder = new ContainerBuilder();
            builder.Populate(services);

            builder
                .RegisterModule<NHibernateIntegration.Module>();
            builder
                .RegisterType<CommonDomainObjects.Mapping.ConventionModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();
            builder
                .RegisterModule(
                    new SQLiteModule(
                        Path.Combine(
                            HostingEnvironment.ContentRootPath,
                            "Database.db")));
            builder
                .RegisterModule(new SessionFactoryModule("Database"));
            builder
                .RegisterModule<Service.Module>();

            ApplicationContainer = builder.Build();

            // Create the IServiceProvider based on the container.
            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(
            IApplicationBuilder app,
            IHostingEnvironment env
            )
        {
            if(env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";
                //spa.Options.SourcePath = @"..\..\ComponentGallery";

                if(env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                    //spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                }
            });
        }
    }
}
