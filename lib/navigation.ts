import {
    LayoutDashboard,
    Package,
    Flame,
    TrendingUp,
    Settings,
    ShoppingCart,
    Users,
    FileText,
    BarChart3,
} from "lucide-react"

export const navigation = [
    { name: "Dashboard", href: "/bo", icon: LayoutDashboard },
    { name: "Matières premières", href: "/bo/matieres", icon: Package },
    { name: "Bougies", href: "/bo/bougies", icon: Flame },
    { name: "Clients", href: "/bo/clients", icon: Users },
    { name: "Commandes", href: "/bo/commandes", icon: ShoppingCart },
    { name: "Bons de commande", href: "/bo/bons-de-commande", icon: FileText },
    { name: "Projections", href: "/bo/projections", icon: TrendingUp },
    { name: "Statistiques", href: "/bo/statistiques", icon: BarChart3 },
    { name: "Paramètres", href: "/bo/parametres", icon: Settings },
]
