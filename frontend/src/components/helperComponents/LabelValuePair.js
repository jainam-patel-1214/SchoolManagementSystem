import { Label, LabelValue, Value } from "../studentComponents/Home"

export const LabelValuePair = (props) => {
    return (
        <LabelValue>
            <Label><strong>{props.label}&nbsp;</strong></Label>
            <Value>{props.value}</Value>
        </LabelValue>
    )
}