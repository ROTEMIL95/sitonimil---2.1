import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Menu,
  X, 
  MessageSquare, 
  User as UserIcon,
  Bell,
  LogIn,
  UserPlus,
  Settings,
  HelpCircle,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  PlusCircle,
  Shield,
  Heart,
  FileText,
  Grid3x3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MobileMenu({
  user,
  notifications,
  showNotifications,
  showMessages,
  setShowNotifications,
  setShowMessages,
  handleLogout,
  isMenuOpen,
  setIsMenuOpen,
  handleLinkClick,
  handlePublishProductClick
}) {
  return (
    <div className="rtl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden focus:ring-2 focus-visible:ring-offset-2 p-2 h-auto w-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {isMenuOpen ? <X className="h-9 w-9 text-gray-900" /> : <Menu className="h-9 w-9 text-gray-900" />}
        </Button>
      </div>
    </div>
  );
} 