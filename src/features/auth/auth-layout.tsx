
import logo from '@/assets/logo.png'

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="transition-transform duration-300 ease-in-out hover:scale-110">
            <img
              src={logo}
              alt="Logo GB soona"
              width={80}
              height={80}
              className="h-20 w-40 object-contain"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
