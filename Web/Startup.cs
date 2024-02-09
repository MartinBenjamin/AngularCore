using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Text.Json.Serialization;

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
            services
                .AddMvc()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler     = ReferenceHandler.Preserve;
                    options.JsonSerializerOptions.PropertyNamingPolicy = null;
                });

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
                .RegisterType<ServiceBasedControllerActivator>()
                .As<IControllerActivator>();
            builder
                .RegisterModule<CommonDomainObjects.Mapping.Module>();
            builder
                .RegisterModule(
                    new SQLiteModule(
                        "Database",
                        Path.Combine(
                            HostingEnvironment.WebRootPath,
                            "Data",
                            "Database.db")));
            builder
                .RegisterModule<Service.Module>();
            builder
                .RegisterModule<ControllerModule>();
            builder
                .RegisterModule<MapperModule>();

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
            app.UseStaticFiles(
                new StaticFileOptions
                {
                    ServeUnknownFileTypes = true,
                });
            app.UseSpaStaticFiles();
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
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
