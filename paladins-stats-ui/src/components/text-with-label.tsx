export interface TextWithLabelProps {
    label: string;
    value?: string|number;
}

export function TextWithLabel(props: TextWithLabelProps) {

    const { label, value } = props;

    if (!value) {
        return undefined;
    }

    return (
        <div className='flex flex-row'>
            <p className='font-bold'>{label}:&nbsp;</p>
            <p>{value}</p>
        </div>
    );
}
