import { FormInput } from "../common/FormInput";

interface RoleInputRowProps {
    index: number;
    title: string;
    seatsTotal: number;
    canRemove: boolean;
    disabled: boolean;
    onChange :(index: number, field: 'title' | 'seatsTotal', value: string | number) => void;
    onRemove: (index: number) => void;
}

export const RoleInputRow = ({
    index,
    title,
    seatsTotal,
    canRemove,
    disabled,
    onChange,
    onRemove
}: RoleInputRowProps) => {
    return (
        <div className="flex gap-2 items-start w-full">
            <div className="flex-1">
                <FormInput
                    placeholder="e.g. senior React Developer"
                    value={title}
                    onChange={(e) => onChange(index, 'title', e.target.value)}
                    disabled={disabled}    
                />
            </div>

            <div className="w-24">
                <FormInput
                    placeholder="Qty"
                    type="number"
                    min="1"
                    value={seatsTotal.toString()}
                    onChange={(e) => onChange(index, 'seatsTotal', parseInt(e.target.value) || 1)}
                    disabled={disabled}
                />
            </div>

            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg font-bold transition flex-shrrink-0 mt-1"
                    disabled={disabled}
                >
                    X
                </button>
            )}
        </div>
    )
}