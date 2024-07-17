
interface buttonTypes{
    label:string;
    onClick:(e:any)=>void
    disabled?: boolean;
}

export function FunctionButton({label,onClick,disabled}:buttonTypes){
    return <button onClick={onClick} type="button" disabled={disabled}
    className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">{label}</button>
}