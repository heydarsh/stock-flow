import React, { useState, useRef, useEffect } from "react"

interface AutocompleteProps {
  options: { symbol: string; name: string }[]
  value: string
  onChange: (value: string) => void
  onSelect: (option: { symbol: string; name: string }) => void
  placeholder?: string
}

export default function Autocomplete({ options, value, onChange, onSelect, placeholder }: AutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [filtered, setFiltered] = useState(options)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showDropdown && value.trim() === "") {
      setFiltered(options)
    } else if (value.trim() !== "") {
      const v = value.toLowerCase()
      setFiltered(
        options.filter(
          (opt) =>
            opt.symbol.toLowerCase().includes(v) ||
            opt.name.toLowerCase().includes(v)
        )
      )
    } else {
      setFiltered([])
    }
  }, [value, options, showDropdown])

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        placeholder={placeholder || "Search stocks..."}
        className="pl-10 pr-4 py-3 w-full rounded-md border-2 border-gray-200 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered.map((opt) => (
            <li
              key={opt.symbol}
              className="px-4 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
              onMouseDown={() => {
                onSelect(opt)
                setShowDropdown(false)
              }}
            >
              <span className="font-bold">{opt.symbol}</span> <span className="text-gray-500">{opt.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
