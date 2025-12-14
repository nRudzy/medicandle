"use client"

import { useMemo, useState } from "react"
import { Material, MaterialType, Unit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type MaterialComboboxProps = {
    materials: Material[]
    value: string
    onChange: (value: string) => void
    materialTypeLabels: Record<MaterialType, string>
    unitLabels: Record<Unit, string>
    placeholder?: string
    name?: string
}

export function MaterialCombobox({
    materials,
    value,
    onChange,
    materialTypeLabels,
    unitLabels,
    placeholder = "Sélectionner...",
    name,
}: MaterialComboboxProps) {
    const [open, setOpen] = useState(false)
    const selectedMaterial = materials.find((m) => m.id === value)

    const buttonLabel = useMemo(() => {
        if (!selectedMaterial) {
            return placeholder
        }

        const supplierLabel = selectedMaterial.supplier ? ` - ${selectedMaterial.supplier}` : ""
        const stockLabel = `Stock: ${Number(selectedMaterial.stockPhysique ?? 0)
            } ${unitLabels[selectedMaterial.unit]}`

        return `${selectedMaterial.name}${supplierLabel} (${stockLabel})`
    }, [placeholder, selectedMaterial, unitLabels])

    return (
        <>
            {name && <input type="hidden" name={name} value={value} />}
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
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Rechercher une matière..." />
                        <CommandList>
                            <CommandEmpty>Aucune matière trouvée.</CommandEmpty>
                            <CommandGroup>
                                {materials.map((material) => {
                                    const supplierLabel = material.supplier
                                        ? ` - ${material.supplier}`
                                        : ""
                                    const stockLabel = `Stock: ${Number(material.stockPhysique ?? 0)
                                        } ${unitLabels[material.unit]}`

                                    return (
                                        <CommandItem
                                            key={material.id}
                                            value={`${material.name} ${material.supplier || ""}`.trim()}
                                            onSelect={() => {
                                                onChange(material.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === material.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {material.name}
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                        ({materialTypeLabels[material.type]})
                                                    </span>
                                                </span>
                                                <div className="text-xs text-muted-foreground">
                                                    {`${material.name}${supplierLabel} (${stockLabel})`}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    )
}
