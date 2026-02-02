import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Crear respuesta inicial
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Actualizar cookies en el request
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // Recrear response con nuevas cookies
          supabaseResponse = NextResponse.next({
            request,
          })

          // Actualizar cookies en el response
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // ✅ CORRECTO: Destructurar data y error
  const { data, error } = await supabase.auth.getClaims()

  // Verificar autenticación usando data.claims.sub
  const isAuthenticated = !error && data?.claims?.sub

  // Proteger rutas del dashboard
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  // Redirigir usuarios autenticados lejos del login
  if (pathname === "/iniciar-sesion" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - archivos estáticos (_next/static, _next/image)
     * - archivos públicos (favicon, imágenes, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
