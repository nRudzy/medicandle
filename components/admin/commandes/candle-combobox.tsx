"use client"

import { useMemo, useState } from "react"
import { Candle } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

type CandleComboboxProps = {
    candles: Candle[]
    value: string
    onChange: (value: string) => void
}

export function CandleCombobox({ candles, value, onChange }: CandleComboboxProps) {
    const [open, setOpen] = useState(false)
    const selectedCandle = useMemo(() => candles.find((c) => c.id === value), [candles, value])

    const buttonLabel = selectedCandle
        ? `${selectedCandle.name}${selectedCandle.format ? ` - ${selectedCandle.format}` : ""}`
        : "Sélectionner une bougie"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate">{buttonLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher une bougie..." />
                    <CommandList>
                        <CommandEmpty>Aucune bougie trouvée.</CommandEmpty>
                        <CommandGroup>
                            {candles.map((candle) => (
                                <CommandItem
                                    key={candle.id}
                                    value={`${candle.name} ${candle.format || ""}`.trim()}
                                    onSelect={() => {
                                        onChange(candle.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === candle.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{candle.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {candle.format ? `${candle.format} • ` : ""}
                                            Prix:{" "}
                                            {candle.currentPrice !== null && candle.currentPrice !== undefined
                                                ? `${Number(candle.currentPrice).toFixed(2)} €`
                                                : "non défini"}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
