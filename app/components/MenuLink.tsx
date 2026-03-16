"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MenuLink() {
  const pathname = usePathname()

  if (pathname === "/menu") return null

  return (
    <Link href="/menu" className="relative group text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
      Menu
      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}