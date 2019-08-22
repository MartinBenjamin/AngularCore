using NHibernate.Mapping.ByCode;
using System.Text.RegularExpressions;

namespace NHibernateIntegration
{
    public class ConventionModelMapperFactory: IModelMapperFactory
    {
        private static readonly Regex _genericArity = new Regex(
            @"`\d+$",
            RegexOptions.Compiled);

        ModelMapper IModelMapperFactory.Build()
        {
            ConventionModelMapper mapper = new ConventionModelMapper();
            Populate(mapper);
            return mapper;
        }

        protected virtual void Populate(
            ConventionModelMapper mapper
            )
        {
            mapper.BeforeMapManyToOne += (
                IModelInspector  modelInspector,
                PropertyPath     member,
                IManyToOneMapper manyToOneMapper
                ) =>
            {
                manyToOneMapper.Column(NameBuilder(member) + "Id");
                manyToOneMapper.ForeignKey(NameBuilder(member) + "_FK");
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

            mapper.BeforeMapProperty += (
                IModelInspector modelInspector,
                PropertyPath    member,
                IPropertyMapper propertyMapper
                ) => propertyMapper.Column(NameBuilder(member));
        }

        private string NameBuilder(
            PropertyPath member
            )
        {
            return member.PreviousPath != null ? NameBuilder(member.PreviousPath) + member.LocalMember.Name : member.LocalMember.Name;
        }

        private string TypeName(
            PropertyPath member
            )
        {
            var type = member.GetRootMember().DeclaringType;
            return type.IsGenericType ? _genericArity.Replace(type.Name, string.Empty) : type.Name;
        }

    }
}
