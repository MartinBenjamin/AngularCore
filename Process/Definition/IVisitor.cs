namespace Process.Definition
{
    public interface IVisitor
    {
        void Visit(Sequence        sequence       );
        void Visit(Parallel        parallel       );
        void Visit(Choice          choice         );
        void Visit(IO              io             );
        void Visit(Input           input          );
        void Visit(Output          output         );
        void Visit(GuardedProcess  guardedProcess );
        void Visit(While           @while         );
        void Visit(SequenceForEach sequenceForEach);
        void Visit(ParallelForEach parallelForEach);
        void Visit(ChoiceForEach   choiceForEach  );
     }
}
