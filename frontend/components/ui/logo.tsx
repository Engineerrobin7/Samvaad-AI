import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/images/logo.png" // Make sure logo.png exists in public/images/
        alt="Samvaad AI Logo"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 text-transparent bg-clip-text">
        Samvaad AI
      </span>
    </Link>
  )
}