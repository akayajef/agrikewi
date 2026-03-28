import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div 
                className="flex aspect-square size-14 items-center justify-center rounded-md bg-transparent text-sidebar-foreground"
            >
                <AppLogoIcon className="h-full w-full object-contain" />
            </div>
            
        </>
    );
}
