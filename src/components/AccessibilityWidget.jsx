import React, { useState, useEffect } from "react";
import { 
  Accessibility, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Moon, 
  Underline,
  MousePointer2, 
  RotateCcw,
  X,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 100,
    contrast: false,
    darkMode: false,
    underlineLinks: false,
    bigCursor: false,
    grayscale: false
  });

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings) => {
    const styleEl = document.getElementById('accessibility-styles') || document.createElement('style');
    styleEl.id = 'accessibility-styles';
    styleEl.innerHTML = `
      body *:not(.accessibility-widget *) {
        font-size: calc(var(--base-font-size) * ${newSettings.fontSize / 100}) !important;
      }

      body h1:not(.accessibility-widget *) {
        font-size: calc(2rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body h2:not(.accessibility-widget *) {
        font-size: calc(1.5rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body h3:not(.accessibility-widget *) {
        font-size: calc(1.25rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body h4:not(.accessibility-widget *) {
        font-size: calc(1.125rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body h5:not(.accessibility-widget *) {
        font-size: calc(1rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body h6:not(.accessibility-widget *) {
        font-size: calc(0.875rem * ${newSettings.fontSize / 100}) !important;
      }

      body p:not(.accessibility-widget *),
      body span:not(.accessibility-widget *),
      body div:not(.accessibility-widget *),
      body a:not(.accessibility-widget *),
      body li:not(.accessibility-widget *),
      body label:not(.accessibility-widget *),
      body input:not(.accessibility-widget *),
      body textarea:not(.accessibility-widget *),
      body button:not(.accessibility-widget *) {
        font-size: calc(1rem * ${newSettings.fontSize / 100}) !important;
      }

      body small:not(.accessibility-widget *),
      body .text-sm:not(.accessibility-widget *) {
        font-size: calc(0.875rem * ${newSettings.fontSize / 100}) !important;
      }
      
      body > *:not(.accessibility-widget):not(.accessibility-button) {
        ${newSettings.darkMode ? 'filter: invert(90%) hue-rotate(180deg);' : ''}
        ${newSettings.contrast ? 'filter: contrast(150%);' : ''}
        ${newSettings.grayscale ? 'filter: grayscale(100%);' : ''}
      }
      
      body > *:not(.accessibility-widget):not(.accessibility-button) img,
      body > *:not(.accessibility-widget):not(.accessibility-button) video {
        ${newSettings.darkMode ? 'filter: invert(100%) hue-rotate(180deg);' : ''}
      }
      
      body > *:not(.accessibility-widget):not(.accessibility-button) a {
        ${newSettings.underlineLinks ? `
          text-decoration: underline !important;
          text-underline-offset: 4px;
          text-decoration-thickness: 2px;
        ` : ''}
      }
      
      .accessibility-button {
        background-color: #2563eb !important;
        color: white !important;
        filter: none !important;
      }
      
      .accessibility-button:hover {
        background-color: #1d4ed8 !important;
      }
      
      .accessibility-button svg {
        color: white !important;
      }
      
      .accessibility-widget,
      .accessibility-widget * {
        font-size: 16px !important;
        color: inherit !important;
        filter: none !important;
      }
      
      .accessibility-widget h2 {
        font-size: 20px !important;
      }
      
      .accessibility-widget p {
        font-size: 14px !important;
      }
      
      .accessibility-widget .setting-label {
        font-size: 16px !important;
      }
      
      .accessibility-widget button {
        font-size: 14px !important;
      }
      
      .accessibility-widget .a11y-value {
        font-size: 14px !important;
        font-weight: 500;
      }
    `;
    
    if (!document.getElementById('accessibility-styles')) {
      document.head.appendChild(styleEl);
    }
    
    document.documentElement.style.setProperty('--base-font-size', '16px');
    
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  const handleBigCursor = (isBigCursor) => {
    const oldCursorStyle = document.getElementById('big-cursor-style');
    if (oldCursorStyle) {
      oldCursorStyle.remove();
    }
    
    if (isBigCursor) {
      const cursorStyle = document.createElement('style');
      cursorStyle.id = 'big-cursor-style';
      cursorStyle.innerHTML = `
        body:not(.accessibility-widget),
        body:not(.accessibility-widget) * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ffffff' stroke='%23000000' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E"), auto !important;
        }
        
        body a:not(.accessibility-widget *),
        body button:not(.accessibility-widget *),
        body [role="button"]:not(.accessibility-widget *),
        body input:not(.accessibility-widget *),
        body select:not(.accessibility-widget *),
        body textarea:not(.accessibility-widget *) {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23ffffff' stroke='%23000000' stroke-width='2'%3E%3Cpath d='M21 11l-8-8-8 8v2h6v8h4v-8h6z'/%3E%3C/svg%3E"), pointer !important;
        }
        
        .accessibility-widget,
        .accessibility-widget * {
          cursor: default !important;
        }
        
        .accessibility-widget button,
        .accessibility-widget .custom-switch,
        .accessibility-widget a {
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(cursorStyle);
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing accessibility settings:', error);
      }
    }
  }, []);

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 100,
      contrast: false,
      darkMode: false,
      underlineLinks: false,
      bigCursor: false,
      grayscale: false
    };
    setSettings(defaultSettings);
    localStorage.removeItem('accessibilitySettings');
  };

  const CustomToggle = ({ checked, onChange, id }) => {
    return (
      <div className="switch-wrapper">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="custom-switch"
        />
      </div>
    );
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`fixed left-0 z-50 rounded-r-full h-14 w-auto px-4 shadow-lg 
                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                accessibility-button transition-all duration-300 ease-in-out
                hover:scale-105 hover:shadow-xl
                flex items-center justify-center gap-2
                border-2 border-white border-l-0
                ${Object.values(settings).some(value => value !== false && value !== 100) 
                  ? 'ring-4 ring-blue-200' 
                  : ''}`}
              style={{
                position: 'fixed',
                top: 'calc(100vh * 0.7)',
                left: '0',
                transform: 'none'
              }}
              aria-label="אפשרויות נגישות"
            >
              <Accessibility className="h-6 w-6 text-white" />
              <span className="font-medium text-white">נגישות</span>
              {Object.values(settings).some(value => value !== false && value !== 100) && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-blue-800 text-white">
            <p className="text-sm font-medium">אפשרויות נגישות</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div 
        className={`accessibility-widget fixed z-50 h-screen bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          position: 'fixed',
          width: '85vw',
          maxWidth: '320px',
          top: '0',
          left: '0',
          height: '100%',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px'
        }}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold">אפשרויות נגישות</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <Label className="setting-label block mb-3 text-lg font-semibold text-gray-800">גודל טקסט</Label>
              <div className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 px-4 bg-white border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl"
                  onClick={() => updateSettings('fontSize', Math.max(80, settings.fontSize - 10))}
                >
                  <ZoomOut className="h-5 w-5 text-gray-700" />
                </Button>
                <span className="a11y-value w-20 text-center text-xl font-bold text-blue-600">{settings.fontSize}%</span>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 px-4 bg-white border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl"
                  onClick={() => updateSettings('fontSize', Math.min(200, settings.fontSize + 10))}
                >
                  <ZoomIn className="h-5 w-5 text-gray-700" />
                </Button>
              </div>
            </div>

            <Separator className="my-4 md:my-6" />

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <Label className="setting-label">מצב כהה</Label>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings('darkMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <Label className="setting-label">ניגודיות גבוהה</Label>
                </div>
                <Switch
                  checked={settings.contrast}
                  onCheckedChange={(checked) => updateSettings('contrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Underline className="h-4 w-4" />
                  <Label className="setting-label">הדגשת קישורים</Label>
                </div>
                <Switch
                  checked={settings.underlineLinks}
                  onCheckedChange={(checked) => updateSettings('underlineLinks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  <Label className="setting-label">סמן גדול</Label>
                </div>
                <Switch
                  checked={settings.bigCursor}
                  onCheckedChange={(checked) => {
                    updateSettings('bigCursor', checked);
                    handleBigCursor(checked);
                  }}
                />
              </div>
            </div>

            <Separator className="my-4 md:my-6" />

            <div className="space-y-4 mb-4">
              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 flex items-center justify-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                איפוס הגדרות
              </Button>

              <Link 
                to={createPageUrl("AccessibilityStatement")}
                onClick={() => setIsOpen(false)}
                className="block w-full py-2.5 px-4 text-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium"
              >
                הצהרת נגישות
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {Object.values(settings).some(value => value !== false && value !== 100) && (
        <div 
          className="fixed z-40 bg-blue-100 text-blue-800 px-3 py-1.5 
            rounded-r-full shadow-md flex items-center gap-2 font-medium text-sm
            border border-blue-200 border-l-0"
          style={{
            fontSize: '12px !important',
            position: 'fixed',
            top: 'calc(100vh * 0.7 + 60px)',
            left: '0'
          }}
        >
          <span>נגישות מופעלת</span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}
    </>
  );
}
