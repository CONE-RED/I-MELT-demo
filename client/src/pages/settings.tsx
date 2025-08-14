import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import ResetControls from '@/components/demo/ResetControls';
import { Settings, Globe, Palette, Bell, Monitor, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { language } = useSelector((state: RootState) => state);
  
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [theme, setTheme] = useState('light');
  const [dateFormat, setDateFormat] = useState('24h');
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  
  const labels = {
    en: {
      title: 'Settings',
      language: 'Language & Region',
      languageLabel: 'Interface Language',
      dateFormat: 'Time Format',
      tempUnit: 'Temperature Unit',
      display: 'Display Settings',
      theme: 'Theme',
      autoRefresh: 'Auto Refresh',
      refreshInterval: 'Refresh Interval',
      notifications: 'Notifications & Alerts',
      enableNotifications: 'Enable Notifications',
      criticalAlerts: 'Critical Alerts',
      soundAlerts: 'Sound Alerts',
      demoControls: 'Demo Controls',
      demoControlsDesc: 'Simulation and demonstration settings',
      system: 'System Settings',
      dataRetention: 'Data Retention',
      exportFormat: 'Export Format',
      save: 'Save Settings',
      reset: 'Reset to Defaults',
      saved: 'Settings saved successfully!',
      seconds: 'seconds',
      minutes: 'minutes'
    },
    ru: {
      title: 'Настройки',
      language: 'Язык и регион',
      languageLabel: 'Язык интерфейса',
      dateFormat: 'Формат времени',
      tempUnit: 'Единица температуры',
      display: 'Настройки отображения',
      theme: 'Тема',
      autoRefresh: 'Автообновление',
      refreshInterval: 'Интервал обновления',
      notifications: 'Уведомления и оповещения',
      enableNotifications: 'Включить уведомления',
      criticalAlerts: 'Критические оповещения',
      soundAlerts: 'Звуковые оповещения',
      demoControls: 'Управление демонстрацией',
      demoControlsDesc: 'Настройки симуляции и демонстрации',
      system: 'Системные настройки',
      dataRetention: 'Хранение данных',
      exportFormat: 'Формат экспорта',
      save: 'Сохранить настройки',
      reset: 'Сбросить к умолчанию',
      saved: 'Настройки успешно сохранены!',
      seconds: 'секунд',
      minutes: 'минут'
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  const handleSaveSettings = () => {
    // Save language preference
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    
    // Show success message
    toast({
      title: labels[lang].saved,
      description: "All settings have been updated.",
      variant: "default"
    });
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };
  
  const handleResetSettings = () => {
    setNotifications(true);
    setAutoRefresh(true);
    setRefreshInterval('30');
    setTheme('light');
    setDateFormat('24h');
    setTemperatureUnit('celsius');
    dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
      variant: "default"
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-cone-red" />
                {labels[lang].title}
              </h1>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleResetSettings}
                  variant="outline"
                >
                  {labels[lang].reset}
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-cone-red hover:bg-cone-red/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {labels[lang].save}
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Language & Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {labels[lang].language}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].languageLabel}</Label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select language" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].dateFormat}</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select time format" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24-hour</SelectItem>
                          <SelectItem value="12h">12-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].tempUnit}</Label>
                      <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select temperature unit" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="celsius">Celsius (°C)</SelectItem>
                          <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    {labels[lang].display}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].theme}</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select theme" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>{labels[lang].autoRefresh}</Label>
                        <Switch
                          checked={autoRefresh}
                          onCheckedChange={setAutoRefresh}
                        />
                      </div>
                      
                      {autoRefresh && (
                        <div className="space-y-2">
                          <Label className="text-gray-800 font-medium">{labels[lang].refreshInterval}</Label>
                          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                            <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                              <SelectValue placeholder="Select refresh interval" className="text-gray-800" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 {labels[lang].seconds}</SelectItem>
                              <SelectItem value="30">30 {labels[lang].seconds}</SelectItem>
                              <SelectItem value="60">1 minute</SelectItem>
                              <SelectItem value="300">5 {labels[lang].minutes}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {labels[lang].notifications}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{labels[lang].enableNotifications}</Label>
                        <p className="text-sm text-gray-700">Receive real-time notifications for heat status changes</p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{labels[lang].criticalAlerts}</Label>
                        <p className="text-sm text-gray-700">High priority alerts for critical system events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{labels[lang].soundAlerts}</Label>
                        <p className="text-sm text-gray-500">Audio notifications for important events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Demo Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    {labels[lang].demoControls}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {labels[lang].demoControlsDesc}
                  </p>
                </CardHeader>
                <CardContent>
                  <ResetControls className="border-0 bg-transparent p-0" />
                </CardContent>
              </Card>
              
              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {labels[lang].system}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].dataRetention}</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select data retention period" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].exportFormat}</Label>
                      <Select defaultValue="xlsx">
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select export format" className="text-gray-800" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                          <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}