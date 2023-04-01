using Autofac;
using NHibernate.Mapping.ByCode;
using System;
using System.Text.RegularExpressions;

namespace NHibernateIntegration
{
    public class Module: Autofac.Module
    {
        private static readonly Regex _genericArity = new Regex(
            @"`\d+$",
            RegexOptions.Compiled);

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .Register<Action<ConventionModelMapper>>(
                    c => mapper =>
                    {
                        mapper.BeforeMapManyToOne += (
                            IModelInspector  modelInspector,
                            PropertyPath     member,
                            IManyToOneMapper manyToOneMapper
                            ) =>
                        {
                            manyToOneMapper.Column(NameBuilder(member) + "Id");
                            manyToOneMapper.ForeignKey(ForeignKeyNameBuilder(member));
                        };

                        mapper.BeforeMapBag += (
                            IModelInspector      modelInspector,
                            PropertyPath         member,
                            IBagPropertiesMapper bagMapper
                            ) =>
                        {
                            bagMapper.Key(keyMapper => keyMapper.Column(TypeName(member) + "Id"));
                            bagMapper.Inverse(true);
                        };

                        mapper.BeforeMapList += (
                            IModelInspector       modelInspector,
                            PropertyPath          member,
                            IListPropertiesMapper listMapper
                            ) =>
                        {
                            listMapper.Key(keyMapper => keyMapper.Column(TypeName(member) + "Id"));
                            listMapper.Inverse(true);
                        };

                        mapper.BeforeMapSet += (
                            IModelInspector      modelInspector,
                            PropertyPath         member,
                            ISetPropertiesMapper setMapper
                            ) =>
                        {
                            setMapper.Key(keyMapper => keyMapper.Column(TypeName(member) + "Id"));
                            setMapper.Inverse(true);
                        };

                        mapper.BeforeMapProperty += (
                            IModelInspector modelInspector,
                            PropertyPath    member,
                            IPropertyMapper propertyMapper
                            ) => propertyMapper.Column(NameBuilder(member));
                    });

            builder
                .RegisterType<ConventionModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();

            builder
                .Register(c => c.Resolve<IModelMapperFactory>().Build())
                .SingleInstance();
        }

        private string NameBuilder(
            PropertyPath member
            )
        {
            return member == null ? string.Empty : NameBuilder(member.PreviousPath) + member.LocalMember.Name;
        }

        private string TypeName(
            PropertyPath member
            )
        {
            var type = member.GetRootMember().DeclaringType;
            return type.IsGenericType ? _genericArity.Replace(type.Name, string.Empty) : type.Name;
        }

        private string ForeignKeyNameBuilder(
            PropertyPath member
            )
        {
            return "FK_" + TypeName(member) + "_" + NameBuilder(member);
        }
    }
}
