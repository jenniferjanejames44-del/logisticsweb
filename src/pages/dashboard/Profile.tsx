import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building, MapPin, Globe, Save, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
}

const countries = [
  "United States", "United Kingdom", "Germany", "France", "China",
  "Japan", "Australia", "Canada", "Nigeria", "UAE", "Singapore", "India"
];

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "", phone: "", company_name: "", address: "", city: "", country: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          company_name: data.company_name || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
      })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile" description="Manage your account settings">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" description="Manage your account settings and preferences">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5 sm:p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
              <User className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{formData.full_name || "User"}</h3>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
            {formData.company_name && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Building className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{formData.company_name}</span>
              </p>
            )}
            {formData.country && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{formData.city ? `${formData.city}, ` : ""}{formData.country}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company Inc."
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, Suite 100"
                  className="min-h-[96px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" variant="default" size="sm" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
