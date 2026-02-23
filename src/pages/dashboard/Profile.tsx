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
import { User, Mail, Phone, Building, MapPin, Globe, Save } from "lucide-react";

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
    full_name: "",
    phone: "",
    company_name: "",
    address: "",
    city: "",
    country: "",
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
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Card */}
        <Card className="border-border/50 lg:col-span-1 card-premium">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground">
              {formData.full_name || "User"}
            </h3>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1 text-sm sm:text-base">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
            {formData.company_name && (
              <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1 text-sm sm:text-base">
                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formData.company_name}</span>
              </p>
            )}
            {formData.country && (
              <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1 text-sm sm:text-base">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formData.city ? `${formData.city}, ` : ""}{formData.country}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border-border/50 lg:col-span-2 card-premium">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="font-heading text-lg sm:text-xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="full_name" className="text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-9 sm:pl-10 h-11 sm:h-12"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="pl-9 sm:pl-10 h-11 sm:h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="company_name" className="text-sm">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Your Company Inc."
                    className="pl-9 sm:pl-10 h-11 sm:h-12"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, Suite 100"
                    className="pl-9 sm:pl-10 min-h-[70px] sm:min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className="h-11 sm:h-12"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger id="country" className="h-11 sm:h-12">
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

              <Button type="submit" variant="cta" className="w-full sm:w-auto" size="lg" disabled={saving}>
                {saving ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
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
