import { ChangeEventHandler, FC } from 'react'

interface Props {
    onChange: ChangeEventHandler<HTMLInputElement>
}

const ChooseFile: FC<Props> = ({ onChange }) => {
    return (
        <input
            className="rounded-md cursor-pointer"
            type="file"
            accept="image/*"
            onChange={onChange}
        />
    )
}

export default ChooseFile
