
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
    defaultBlockchain: "ethereum",
    email: "user@example.com"
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully"
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates about your assets</p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(s => ({...s, notifications: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={settings.twoFactor}
                onCheckedChange={(checked) => 
                  setSettings(s => ({...s, twoFactor: checked}))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Default Blockchain Network</Label>
              <Select 
                value={settings.defaultBlockchain}
                onValueChange={(value) => 
                  setSettings(s => ({...s, defaultBlockchain: value}))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="binance">Binance Smart Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                value={settings.email}
                onChange={(e) => 
                  setSettings(s => ({...s, email: e.target.value}))
                }
              />
            </div>

            <Button className="w-full" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
