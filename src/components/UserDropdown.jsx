import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
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
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/*
 * NOTE: This component is no longer used directly.
 * The UserDropdown functionality has been integrated directly into Layout.jsx
 * under the EllipsisVertical icon dropdown.
 */
export default function UserDropdown({ user, onLogout }) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus:ring-2 focus-visible:ring-offset-2"
        >
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={user?.profileImage} alt={user?.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="start">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-2">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={user?.profileImage} alt={user?.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{user?.name}</span>
            <span className="text-sm text-gray-500">{user?.email}</span>
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium">פרופיל</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Settings className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium">הגדרות</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/help" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">עזרה</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex justify-center gap-2 p-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Instagram className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Mail className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 hover:text-red-600"
        >
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <span className="font-medium">התנתק</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 