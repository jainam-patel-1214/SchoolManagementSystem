import { Label, LabelValue, Value } from "../studentComponents/Home"

export const LabelValuePair = ({label,value}) => {
    return (
        <LabelValue>
            <Label><strong>{label}&nbsp;</strong></Label>
            <Value>{value}</Value>
        </LabelValue>
    )
}