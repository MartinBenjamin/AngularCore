namespace Process.Definition
{
    public interface ISelector<TResult>
    {    
        TResult Select(Sequence             sequence            );
        TResult Select(Parallel             parallel            );
        TResult Select(Choice               choice              );
        TResult Select(Input                input               );
        TResult Select(Output               output              );
        TResult Select(GuardedProcess       guardedProcess      );
        TResult Select(While                @while              );
        TResult Select(SequenceForEach      sequenceForEach     );
        TResult Select(ParallelForEach      parallelForEach     );
        TResult Select(ChoiceForEach        choiceForEach       );
        TResult Select(InfinitelyReplicated infinitelyReplicated);
    }
}
