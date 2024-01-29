namespace Process.Definition
{
    public interface IVisitor
    {
        bool Enter(Sequence        sequence       );
        bool Enter(Parallel        parallel       );
        bool Enter(Choice          choice         );
        bool Enter(IO              io             );
        bool Enter(Input           input          );
        bool Enter(GuardedProcess  guardedProcess );
        bool Enter(While           @while         );
        bool Enter(SequenceForEach sequenceForEach);
        bool Enter(ParallelForEach parallelForEach);
        bool Enter(ChoiceForEach   choiceForEach  );
        bool Exit(Sequence         sequence       );
        bool Exit(Parallel         parallel       );
        bool Exit(Choice           choice         );
        bool Exit(GuardedProcess   guardedProcess );
    }
}
