import { IRegularPathExpression, Property, Alternative, Sequence, ZeroOrOne } from "./RegularPathExpression";

enum InstructionType
{
    Cmp,
    Fork,
    Jump
}

interface Instruction
{
    Type : InstructionType
}

interface Cmp extends Instruction
{
    Property: string;
}

interface Jump extends Instruction
{
    TargetIndex: number;
}

interface Fork extends Instruction
{
    TargetIndex: number;
}

type Program = Instruction[];

interface Thread
{
    Program         : Program;
    InstructionIndex: number;
    Object          : object;
}

function Query(): Set<object>
{
    let program: Program;
    let result = new Set<any>();

    let threads: Thread[] = [];
    for(let thread of threads)
    {
        if(thread.InstructionIndex === program.length)
            result.add(thread.Object);

        let instruction = program[thread.InstructionIndex];
        switch(instruction.Type)
        {
            case InstructionType.Cmp:
                let cmp = <Cmp>instruction;
                if(typeof thread.Object === 'object' && thread.Object !== null)
                    if(cmp.Property === '.')
                        for(let key in thread.Object)
                        {
                            let value = thread.Object[key];
                            if(value instanceof Array)
                                value.forEach(
                                    element => threads.push(<Thread>{ ...thread, InstructionIndex: thread.InstructionIndex + 1, Object: element }));

                            else
                            {
                                thread.Object = value;
                                thread.InstructionIndex += 1;
                                threads.push(thread);
                            }
                        }
                    else if(cmp.Property in thread.Object)
                    {
                        let value = thread.Object[cmp.Property];
                        if(value instanceof Array)
                            value.forEach(
                                element => threads.push(<Thread>{ ...thread, InstructionIndex: thread.InstructionIndex + 1, Object: element }));

                        else
                        {
                            thread.Object = value;
                            thread.InstructionIndex += 1;
                            threads.push(thread);
                        }
                    }
                break;

            case InstructionType.Fork:
                let fork = <Fork>instruction;
                threads.push(<Thread>{ ...thread, InstructionIndex: fork.TargetIndex });
                thread.InstructionIndex += 1;
                threads.push(thread);
                break;

            case InstructionType.Jump:
                let jump = (<Jump>instruction);
                thread.InstructionIndex = jump.TargetIndex;
                threads.push(thread);
                break;
        }
    }

    return result;
}

function Compile(
    regularPathExpression: IRegularPathExpression,
    program             ?: Program
    ): Program
{
    program = program ? program : [];

    if(regularPathExpression instanceof Property)
        program.push(<Cmp>{ Property: regularPathExpression.Name });

    else if(regularPathExpression instanceof Alternative)
    {
        let forkToStartInstructions = new Map<IRegularPathExpression, Fork>();

        for(let index = 1; index < regularPathExpression.RegularPathExpressions.length; ++index)
        {
            let fork = <Fork>{ TargetIndex: -1 };
            forkToStartInstructions.set(regularPathExpression.RegularPathExpressions[index], fork);
            program.push(fork);
        }

        Compile(
            regularPathExpression.RegularPathExpressions[0],
            program);

        let jump = <Jump>{ TargetIndex: -1 };
        program.push(jump);

        for(let index = 1; index < regularPathExpression.RegularPathExpressions.length; ++index)
        {
            let alternative = regularPathExpression.RegularPathExpressions[index];
            forkToStartInstructions.get(alternative).TargetIndex = program.length;
            Compile(
                alternative,
                program);
            program.push(jump)
        }

        jump.TargetIndex = program.length;
    }
    else if(regularPathExpression instanceof Sequence)
        regularPathExpression.RegularPathExpressions.forEach(
            regularPathExpression => Compile(
                regularPathExpression,
                program));

    else if(regularPathExpression instanceof ZeroOrOne)
    {
        let fork = <Jump>{ TargetIndex: -1 };
        program.push(fork);
        Compile(
            regularPathExpression.RegularPathExpression,
            program);
        fork.TargetIndex = program.length;
    }

    return program;
}
