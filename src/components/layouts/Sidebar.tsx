
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Database, 
  Users, 
  Tag, 
  Receipt, 
  FileText, 
  BarChart, 
  Calendar,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Purchase', path: '/purchase', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Database },
  { name: 'Customer', path: '/customer', icon: Users },
  { name: 'Supplier', path: '/supplier', icon: User },
  { name: 'Product Price', path: '/product-price', icon: Tag },
  { name: 'Sales', path: '/sales', icon: Receipt },
  { name: 'Billing', path: '/billing', icon: FileText },
  { name: 'Report', path: '/report', icon: BarChart },
  { name: 'Order', path: '/order', icon: Calendar }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside 
      className={`bg-white border-r border-gray-200 fixed left-0 top-16 h-full transition-all duration-300 z-10 ${
        isOpen ? 'w-64' : 'w-0 -translate-x-full'
      }`}
    >
      <div className="py-4 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 text-base rounded-lg hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
