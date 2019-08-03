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
                IManyToOneMapper manyToOneMapping
                ) =>
            {
                manyToOneMapping.Column(NameBuilder(member) + "Id");
                manyToOneMapping.ForeignKey(NameBuilder(member) + "_FK");
            };

            mapper.BeforeMapBag += (
                IModelInspector      modelInspector,
                PropertyPath         member,
                IBagPropertiesMapper bagMapping
                ) =>
            {
                bagMapping.Key(keyMapping => keyMapping.Column(TypeName(member) + "Id"));
                bagMapping.Inverse(true);
            };

            mapper.BeforeMapProperty += (
                IModelInspector modelInspector,
                PropertyPath    member,
                IPropertyMapper propertyMapping
                ) => propertyMapping.Column(NameBuilder(member));
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
