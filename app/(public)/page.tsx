import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/branding/medicandle_logo_no_bg.png"
              alt="Medicandle"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-stone-800">
            Medicandle
          </h1>
          <p className="text-xl text-stone-600 font-light">
            Bougies artisanales haut de gamme
          </p>
          <div className="pt-8">
            <p className="text-stone-500">
              Site en construction
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
