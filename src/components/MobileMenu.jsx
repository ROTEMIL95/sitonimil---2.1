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
import { motion, AnimatePresence } from "framer-motion";

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
  isApplicationMenuOpen,
  setApplicationMenuOpen,
  handleLinkClick,
  handlePublishProductClick
}) {
  return (
    <>
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 right-0 left-auto z-50 w-72 bg-white shadow-xl"
            style={{ height: '100vh', top: 0 }}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            id="mobile-menu"
            role="navigation"
            aria-label="תפריט נייד"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-white z-10">
                <h2 className="font-semibold text-lg">תפריט</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="focus:ring-2 focus-visible:ring-offset-2 p-1.5 h-auto w-auto"
                  aria-label="סגור תפריט"
                >
                  <X className="h-7 w-7 text-blue-700" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.is_admin && (
                          <Badge className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            מנהל
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        to={createPageUrl("Profile")}
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          handleLinkClick();
                          setIsMenuOpen(false);
                        }}
                      >
                        <UserIcon className="w-5 h-5 ml-3 text-blue-600" />
                        <span>הפרופיל שלי</span>
                      </Link>

                      <Link
                        to={createPageUrl("MyProducts")}
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          handleLinkClick();
                          setIsMenuOpen(false);
                        }}
                      >
                        <FileText className="w-5 h-5 ml-3 text-green-600" />
                        <span>המוצרים שלי</span>
                      </Link>

                      <Link
                        to={createPageUrl("Favorites")}
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          handleLinkClick();
                          setIsMenuOpen(false);
                        }}
                      >
                        <Heart className="w-5 h-5 ml-3 text-pink-600" />
                        <span>מועדפים</span>
                      </Link>

                      <Link
                        to={createPageUrl("Settings")}
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          handleLinkClick();
                          setIsMenuOpen(false);
                        }}
                      >
                        <Settings className="w-5 h-5 ml-3 text-gray-600" />
                        <span>הגדרות</span>
                      </Link>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setApplicationMenuOpen(!isApplicationMenuOpen);
                        }}
                      >
                        <Grid3x3 className="w-5 h-5 ml-3 text-purple-600" />
                        <span>תפריט אפליקציה</span>
                      </Button>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 ml-2" />
                        התנתק
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to={createPageUrl("Help") + "?tab=faq"}
                      className="flex items-center px-4 pt-3 pb-1 mb-1 rounded-md hover:bg-gray-50"
                      onClick={() => {
                        handleLinkClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <HelpCircle className="w-5 h-5 ml-3" />
                      <span> שאלות נפוצות</span>
                    </Link>

                    <Link
                      to={createPageUrl("Help") + "?tab=contact"}
                      className="flex items-center px-4 py-1 mb-1 rounded-md hover:bg-gray-50"
                      onClick={() => {
                        handleLinkClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <Mail className="w-5 h-5 ml-3" />
                      <span>צור קשר</span>
                    </Link>

                    <h3 className="text-sm font-bold mt-6 mb-4 text-gray-500 px-2 pb-1 pt-3 border-t border-gray-200">התחברות / הרשמה</h3>

                    <Button 
                      className="w-full bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus-visible:ring-offset-2" 
                      asChild
                    >
                      <Link to={createPageUrl("Auth") + "?tab=login"}>
                        <LogIn className="h-4 w-4" />
                        <span>התחברות</span>
                      </Link>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full border-blue-700 text-blue-700 flex items-center gap-2 justify-center hover:bg-blue-50 focus:outline-none focus:ring-2 focus-visible:ring-offset-2" 
                      asChild
                    >
                      <Link to={createPageUrl("Auth") + "?tab=register"}>
                        <UserPlus className="h-4 w-4" />
                        <span>הרשמה</span>
                      </Link>
                    </Button>

                    <div className="flex justify-center gap-4 mt-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full h-10 w-10"
                        onClick={() => {
                          window.open('https://www.facebook.com/sitonimil', '_blank');
                          setIsMenuOpen(false);
                        }}
                        aria-label="פייסבוק"
                      >
                        <Facebook className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-100 hover:bg-sky-100 hover:text-sky-500 rounded-full h-10 w-10"
                        onClick={() => {
                          window.open('https://twitter.com/sitonimil', '_blank');
                          setIsMenuOpen(false);
                        }}
                        aria-label="טוויטר"
                      >
                        <Twitter className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-100 hover:bg-pink-100 hover:text-pink-600 rounded-full h-10 w-10"
                        onClick={() => {
                          window.open('https://www.instagram.com/sitonimil', '_blank');
                          setIsMenuOpen(false);
                        }}
                        aria-label="אינסטגרם"
                      >
                        <Instagram className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-100 hover:bg-blue-100 hover:text-blue-800 rounded-full h-10 w-10"
                        onClick={() => {
                          window.open('https://www.linkedin.com/company/sitonimil', '_blank');
                          setIsMenuOpen(false);
                        }}
                        aria-label="לינקדאין"
                      >
                        <Linkedin className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 