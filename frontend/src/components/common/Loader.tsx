export const Loader = ({ message = "Laodiing..."}: {message?: string}) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-zinc-500 animate-pulse">{message}</p>
        </div>
    )
}