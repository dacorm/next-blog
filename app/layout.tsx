import Link from "next/link";
import '../src/styles/globals.css';

export const metadata = {
  title: 'Блог о чистом и оптимизированном коде',
  description: 'Делюсь своим опытом в разработке веб приложений',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const header = (
      <header>
        <div className='text-center bg-slate-800 p-8 my-6 rounded-md'>
          <Link href={'/'}>
              <h1 className='text-3xl text-white font-bold'>
                  Блог о разработке на TypeScript/Rust
              </h1>
          </Link>
          <p className='text-slate-300'>Связаться со мной <a href='https://t.me/dacorm' target='_blank'>@dacorm</a></p>
        </div>
      </header>
  )

  const footer = (
      <footer className='border-t border-slate-400 mt-6 py-6 text-center text-slate-400'>
        <div>
          <p>Developed by Denis Utkin</p>
        </div>
      </footer>
  )

  return (
    <html lang="en">
      <body>
      <div className='mx-auto max-w-2xl px-6'>
          {header}
          {children}
          {footer}
      </div>
      </body>
    </html>
  )
}
