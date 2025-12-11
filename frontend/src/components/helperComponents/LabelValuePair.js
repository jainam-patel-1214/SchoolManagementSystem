import { LabelValue } from "../studentComponents/Home"

export const LabelValuePair = ({label,value}) => {
    return (
        <LabelValue>
            <p><strong>{label}&nbsp;</strong></p>
            <p>{value}</p>
        </LabelValue>
    )
}