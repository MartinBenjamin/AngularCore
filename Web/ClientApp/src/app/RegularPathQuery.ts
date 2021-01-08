import { IRegularPathExpression, Property } from "./RegularPathExpression";

enum InstructionType
{
    Cmp,
    Fork,
    Jump
}

type Label = number;

interface Instruction
{
    Label: Label;
    Type : InstructionType
}

interface Cmp extends Instruction
{
    Property: string;
}

interface Jump extends Instruction
{
    TargetLabel: Label;
}

interface Fork extends Instruction
{
    TargetLabel: Label;
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
    let labeledInstructionIndex = new Map<Label, number>();
    for(let instructionIndex = 0; instructionIndex < program.length; ++instructionIndex)
    {
        let instruction = program[instructionIndex];
        if(instruction.Label !== null)
            labeledInstructionIndex.set(
                instruction.Label,
                instructionIndex);
    }

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
                threads.push(<Thread>{ ...thread, InstructionIndex: labeledInstructionIndex.get(fork.TargetLabel) });
                thread.InstructionIndex += 1;
                threads.push(thread);
                break;

            case InstructionType.Jump:
                let jump = (<Jump>instruction);
                thread.InstructionIndex = labeledInstructionIndex.get(jump.TargetLabel);
                threads.push(thread);
                break;
        }
    }

    return result;
}

function Compile(
    regularPathExpression: IRegularPathExpression,
    program              : Program
    ): Program
{
    program = program ? program : [];

    if(regularPathExpression instanceof Property)
        program.push(<Cmp>
            {
                //Property: regularPathExpression.
            });



    return program;
}
