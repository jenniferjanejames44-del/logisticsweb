import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building, Globe, Save, Loader2 } from "lucide-react";
import LocationSelector from "@/components/shipments/LocationSelector";
import LocationPicker from "@/components/shipments/LocationPicker";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "", phone: "", company_name: "", address: "", city: "", state: "", country: "", zip_code: "",
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
        setProfile(data as any);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          company_name: data.company_name || "",
          address: data.address || "",
          city: data.city || "",
          state: (data as any).state || "",
          country: data.country || "",
          zip_code: (data as any).zip_code || "",
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
        state: formData.state || null,
        country: formData.country || null,
        zip_code: formData.zip_code || null,
      } as any)
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {/* Profile Summary */}
        <Card className="lg:col-span-1 border-border/50">
          <CardContent className="p-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/8">
              <User className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">{formData.full_name || "User"}</h3>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
            {formData.company_name && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
                <Building className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formData.company_name}</span>
              </p>
            )}
            {formData.country && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formData.city ? `${formData.city}, ` : ""}{formData.country}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="px-5">
            <CardTitle className="text-sm font-semibold">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-xs font-medium">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11 sm:h-12 text-sm border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="h-11 sm:h-12 text-sm border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-xs font-medium">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company Inc."
                  className="h-11 sm:h-12 text-sm border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-medium">Address</Label>
                <LocationPicker
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  onLocationSelect={(loc) =>
                    setFormData((f) => ({
                      ...f,
                      address: loc.address || f.address,
                      city: loc.city || f.city,
                      state: loc.state || f.state,
                      country: loc.country || f.country,
                    }))
                  }
                  country={formData.country}
                  state={formData.state}
                  city={formData.city}
                  placeholder="Search street, building, landmark"
                  className="h-11 sm:h-12 text-sm border-border/60"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-medium">Country / State / City</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <LocationSelector
                      country={formData.country}
                      state={formData.state}
                      city={formData.city}
                      onCountryChange={(v) => setFormData((f) => ({ ...f, country: v, state: "", city: "" }))}
                      onStateChange={(v) => setFormData((f) => ({ ...f, state: v, city: "" }))}
                      onCityChange={(v) => setFormData((f) => ({ ...f, city: v }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code" className="text-xs font-medium">Zip / Postal Code</Label>
                  <Input id="zip_code" value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="100001" className="h-11 sm:h-12 text-sm border-border/60" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="h-11 sm:h-12 px-5 text-sm font-semibold bg-accent hover:bg-accent/90 text-white rounded-lg"
              >
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
