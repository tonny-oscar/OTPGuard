import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  ChartBarIcon,
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
  UsersIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import { useSubscription } from '../../hooks/useSubscription';
import { usePlanAccess } from '../../hooks/useSubscription';
import PlanBadge from '../shared/PlanBadge';

export default function Sidebar({ open, onClose, mobile = false }) {
  const location = useLocation();
  const { currentPlan } = useSubscription();
  
  // Define navigation based on plan
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, plans: ['starter', 'growth', 'business', 'enterprise'] },
      { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, plans: ['growth', 'business', 'enterprise'], locked: ['starter'] },
      { name: 'System Health', href: '/system-health', icon: ServerIcon, plans: ['enterprise'], locked: ['starter', 'growth', 'business'] },
      { name: 'Devices', href: '/devices', icon: DevicePhoneMobileIcon, plans: ['business', 'enterprise'], locked: ['starter', 'growth'] },
      { name: 'Team', href: '/team', icon: UsersIcon, plans: ['enterprise'], locked: ['starter', 'growth', 'business'] },
    ];
    
    const otpNav = [
      { name: 'API Keys', href: '/api-keys', icon: KeyIcon, plans: ['starter', 'growth', 'business', 'enterprise'] },
      { name: 'Email OTP', href: '/email-otp', icon: EnvelopeIcon, plans: ['starter', 'growth', 'business', 'enterprise'] },
      { name: 'SMS OTP', href: '/sms-otp', icon: DevicePhoneMobileIcon, plans: ['growth', 'business', 'enterprise'], locked: ['starter'] },
      { name: 'Authenticator', href: '/authenticator', icon: ShieldCheckIcon, plans: ['business', 'enterprise'], locked: ['starter', 'growth'] },
      { name: 'Backup Codes', href: '/backup-codes', icon: DocumentDuplicateIcon, plans: ['business', 'enterprise'], locked: ['starter', 'growth'] },
    ];
    
    const settingsNav = [
      { name: 'Usage & Billing', href: '/usage', icon: CurrencyDollarIcon, plans: ['growth', 'business', 'enterprise'], locked: ['starter'] },
      { name: 'Activity Logs', href: '/logs', icon: ClipboardDocumentListIcon, plans: ['starter', 'growth', 'business', 'enterprise'] },
      { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardDocumentListIcon, plans: ['enterprise'], locked: ['starter', 'growth', 'business'] },
      { name: 'Branding', href: '/branding', icon: PaintBrushIcon, plans: ['business', 'enterprise'], locked: ['starter', 'growth'] },
      { name: 'White-Label', href: '/white-label', icon: PaintBrushIcon, plans: ['enterprise'], locked: ['starter', 'growth', 'business'] },
      { name: 'Integrations', href: '/integrations', icon: PuzzlePieceIcon, plans: ['enterprise'], locked: ['starter', 'growth', 'business'] },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, plans: ['starter', 'growth', 'business', 'enterprise'] },
    ];
    
    return { baseNav, otpNav, settingsNav };
  };
  
  const { baseNav, otpNav, settingsNav } = getNavigation();
  
  const isActive = (href) => location.pathname === href;
  const isAccessible = (item) => item.plans.includes(currentPlan);
  const isLocked = (item) => item.locked?.includes(currentPlan);
  
  const NavItem = ({ item }) => {
    const active = isActive(item.href);
    const accessible = isAccessible(item);
    const locked = isLocked(item);
    
    const baseClasses = "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors";
    const activeClasses = active 
      ? "bg-blue-50 text-blue-600" 
      : "text-gray-700 hover:bg-gray-50";
    const lockedClasses = locked ? "opacity-50 cursor-not-allowed" : "";
    
    const content = (
      <>
        <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
        <span className="flex-1">{item.name}</span>
        {locked && <LockClosedIcon className="h-4 w-4 text-gray-400" />}
      </>
    );
    
    if (locked) {
      return (
        <div className={`${baseClasses} ${lockedClasses}`} title={`Upgrade to unlock ${item.name}`}>
          {content}
        </div>
      );
    }
    
    return (
      <Link to={item.href} className={`${baseClasses} ${activeClasses}`}>
        {content}
      </Link>
    );
  };
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-600">OTPGuard</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="lg:hidden">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>
      
      {/* Plan Badge */}
      <div className="px-4 py-3 border-b border-gray-200">
        <PlanBadge />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <div className="space-y-1">
            {baseNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>
        
        {/* OTP Methods */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            OTP Methods
          </h3>
          <div className="mt-2 space-y-1">
            {otpNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>
        
        {/* Settings */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            {settingsNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>
      
      {/* Upgrade CTA */}
      {currentPlan !== 'enterprise' && (
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/upgrade"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
          >
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Link>
        </div>
      )}
    </div>
  );
  
  if (mobile) {
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>
          
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
  
  return <SidebarContent />;
}
