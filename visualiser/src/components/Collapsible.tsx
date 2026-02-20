import { useState } from "react"

interface Props {
    title: string
    defaultOpen?: boolean
    children: React.ReactNode
}

export default function Collapsible({ title, defaultOpen = true, children }: Props) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="border-t border-gray-800">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-white font-mono text-sm font-bold hover:bg-gray-900 transition-colors"
            >
                <span>{title}</span>
                <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
            </button>
            {open && <div>{children}</div>}
        </div>
    )
}