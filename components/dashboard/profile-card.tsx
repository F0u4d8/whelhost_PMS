"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, Mail, Phone, MapPin, Building, Calendar, Camera, Key, Shield, Home, UserRound, Clock, Coins, Image } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile, Hotel } from "@/lib/types"

interface ProfileCardProps {
  user: SupabaseUser
  profile: Profile | null
  hotel: Hotel | null
}

export function ProfileCard({ user, profile, hotel }: ProfileCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    nationality: profile?.nationality || "",
    id_type: profile?.id_type || "",
    id_number: profile?.id_number || "",
  })

  const [hotelData, setHotelData] = useState({
    name: hotel?.name || "",
    description: hotel?.description || "",
    address: hotel?.address || "",
    city: hotel?.city || "",
    country: hotel?.country || "",
    phone: hotel?.phone || "",
    email: hotel?.email || "",
    logo_url: hotel?.logo_url || "",
    timezone: hotel?.timezone || "Asia/Riyadh",
    currency: hotel?.currency || "SAR",
    check_in_time: hotel?.check_in_time || "14:00",
    check_out_time: hotel?.check_out_time || "12:00",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("profiles").update(profileData).eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      setNotification({type: 'error', message: "Error updating profile: " + error.message})
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
    setNotification({type: 'success', message: "Profile updated successfully!"})
  }

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    if (hotel) {
      const { error } = await supabase.from("hotels").update(hotelData).eq("id", hotel.id)

      if (error) {
        console.error("Error updating hotel:", error)
        setNotification({type: 'error', message: "Error updating hotel: " + error.message})
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.refresh()
    setNotification({type: 'success', message: "Hotel information updated successfully!"})
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({type: 'error', message: "New passwords do not match"});
      return
    }

    if (passwordData.newPassword.length < 6) {
      setNotification({type: 'error', message: "New password must be at least 6 characters long"});
      return
    }

    setPasswordLoading(true)
    const supabase = createClient()

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: passwordData.currentPassword,
    });

    if (signInError) {
      setNotification({type: 'error', message: "Current password is incorrect: " + signInError.message});
      setPasswordLoading(false);
      return;
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      setNotification({type: 'error', message: "Error updating password: " + updateError.message});
      setPasswordLoading(false);
      return;
    }

    // Reset the form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordLoading(false);
    router.refresh();
    setNotification({type: 'success', message: "Password updated successfully. You may need to sign in again on other devices."});
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    const supabase = createClient()

    // Sanitize the filename by removing special characters
    const sanitizeFileName = (filename: string) => {
      return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscores
        .replace(/__+/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    };

    // Upload the file to Supabase storage in the 'profil' bucket
    let { data, error } = await supabase.storage
      .from('profil')
      .upload(`${user.id}/${Date.now()}_${sanitizeFileName(file.name)}`, file, {
        cacheControl: '3600',
        upsert: true
      })

    // If upload to 'profil' bucket fails, try the 'avatars' bucket as fallback
    if (error) {
      console.warn("Profil bucket not found, trying avatars bucket:", error.message)
      const fallbackResult = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${Date.now()}_${sanitizeFileName(file.name)}`, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (fallbackResult.error) {
        console.error("Error uploading avatar to both buckets:", error, fallbackResult.error)
        setNotification({type: 'error', message: "Error uploading avatar: " + error.message})
        setAvatarLoading(false)
        return
      }

      data = fallbackResult.data
    }

    // Update the profile with the avatar URL
    // Using the supabase.auth.getUser() context ensures proper RLS permissions
    try {
      // Build the public URL for the avatar
      const publicUrl = supabase.storage.from('profil').getPublicUrl(data.path).data?.publicUrl ||
                        supabase.storage.from('avatars').getPublicUrl(data.path).data?.publicUrl;

      if (publicUrl) {
        // The user context from the session should have the proper permissions
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)
          .select(); // Adding select() might help with RLS policy

        if (updateError) {
          console.error("Error updating profile with avatar URL:", updateError);
          setNotification({type: 'error', message: "Avatar uploaded but profile update failed: " + updateError.message});
        } else {
          setNotification({type: 'success', message: "Profile picture updated successfully!"});
        }
      }
    } catch (updateError: any) {
      console.error("Error updating profile with avatar URL:", updateError);
      setNotification({type: 'error', message: "Avatar uploaded but profile update failed: " + updateError.message});
    }

    setAvatarLoading(false)
    router.refresh()
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-8">
      {/* Notification Component */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === 'success'
            ? 'bg-green-50/80 border-green-200/50 text-green-800'
            : 'bg-red-50/80 border-red-200/50 text-red-800'
        } backdrop-blur-sm`}>
          {notification.message}
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border-amber-200 border-r border-border/30 last:border-r-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
            >
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>Profile</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border-amber-200 border-r border-border/30 rounded-none"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Password</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="hotel"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border-amber-200 rounded-none last:rounded-r-lg"
            >
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Hotel</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-border/30">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-medium italic flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-700" />
                    Personal Information
                  </h3>
                  <p className="text-muted-foreground mt-1 italic">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6 border-b border-border/30 pb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border/30">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-amber-700 hover:bg-amber-600 text-white"
                      onClick={triggerFileInput}
                      disabled={avatarLoading}
                    >
                      {avatarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      This will be displayed on your profile and in messages.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4 text-amber-700" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="cursor-not-allowed bg-muted/30 border-white"
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Email cannot be changed directly. Contact support for assistance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-amber-700" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="border-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-amber-700" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-amber-700" />
                        Nationality
                      </Label>
                      <Input
                        id="nationality"
                        value={profileData.nationality}
                        onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                        placeholder="Enter your nationality"
                        className="border-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_type" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-amber-700" />
                        ID Type
                      </Label>
                      <select
                        id="id_type"
                        value={profileData.id_type}
                        onChange={(e) => setProfileData({ ...profileData, id_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-white bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" className="italic">Select ID Type</option>
                        <option value="passport" className="italic">Passport</option>
                        <option value="national_id" className="italic">National ID</option>
                        <option value="driver_license" className="italic">Driver's License</option>
                        <option value="residence_permit" className="italic">Residence Permit</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_number" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-amber-700" />
                      ID Number
                    </Label>
                    <Input
                      id="id_number"
                      value={profileData.id_number}
                      onChange={(e) => setProfileData({ ...profileData, id_number: e.target.value })}
                      placeholder="Enter your ID number"
                      className="border-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-amber-700" />
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      className="flex min-h-[100px] w-full rounded-md border border-white bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || avatarLoading}
                    className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.refresh()}
                    className="border-border/30"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-border/30">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-medium italic flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-700" />
                  Change Password
                </h3>
                <p className="text-muted-foreground mt-1 italic">Update your account password for better security</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="border-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="border-white"
                    />
                    <p className="text-xs text-muted-foreground italic">Password must be at least 6 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      className="border-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
                  >
                    {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.refresh()}
                    className="border-border/30"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hotel">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-border/30">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-medium italic flex items-center gap-2">
                  <Building className="h-5 w-5 text-amber-700" />
                  Hotel Information
                </h3>
                <p className="text-muted-foreground mt-1 italic">Manage your hotel details and settings</p>
              </div>

              {!hotel ? (
                <div className="py-12 text-center border border-dashed border-border/30 rounded-xl">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No hotel configured</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't created a hotel yet. Contact support to set up your property.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHotelSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotel_name" className="flex items-center gap-2 text-sm font-medium">
                        <Building className="h-4 w-4 text-amber-700" />
                        Hotel Name
                      </Label>
                      <Input
                        id="hotel_name"
                        value={hotelData.name}
                        onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
                        placeholder="Enter hotel name"
                        className="border-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hotel_description" className="flex items-center gap-2 text-sm font-medium">
                        <Building className="h-4 w-4 text-amber-700" />
                        Description
                      </Label>
                      <textarea
                        id="hotel_description"
                        value={hotelData.description}
                        onChange={(e) => setHotelData({ ...hotelData, description: e.target.value })}
                        placeholder="Describe your hotel"
                        className="flex min-h-[100px] w-full rounded-md border border-white bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hotel_address" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-amber-700" />
                        Address
                      </Label>
                      <Input
                        id="hotel_address"
                        value={hotelData.address}
                        onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
                        placeholder="Enter hotel address"
                        className="border-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hotel_city" className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-amber-700" />
                          City
                        </Label>
                        <Input
                          id="hotel_city"
                          value={hotelData.city}
                          onChange={(e) => setHotelData({ ...hotelData, city: e.target.value })}
                          placeholder="Enter city"
                          className="border-border/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hotel_country" className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-amber-700" />
                          Country
                        </Label>
                        <Input
                          id="hotel_country"
                          value={hotelData.country}
                          onChange={(e) => setHotelData({ ...hotelData, country: e.target.value })}
                          placeholder="Enter country"
                          className="border-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hotel_phone" className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="h-4 w-4 text-amber-700" />
                          Phone
                        </Label>
                        <Input
                          id="hotel_phone"
                          type="tel"
                          value={hotelData.phone}
                          onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
                          placeholder="Enter hotel phone number"
                          className="border-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hotel_email" className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4 text-amber-700" />
                          Email
                        </Label>
                        <Input
                          id="hotel_email"
                          type="email"
                          value={hotelData.email}
                          onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
                          placeholder="Enter hotel email"
                          className="border-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hotel_timezone" className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-amber-700" />
                          Timezone
                        </Label>
                        <select
                          id="hotel_timezone"
                          value={hotelData.timezone}
                          onChange={(e) => setHotelData({ ...hotelData, timezone: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-white bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Asia/Riyadh">Arabia Standard Time (AST)</option>
                          <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                          <option value="Asia/Baghdad">Arabia Standard Time (AST)</option>
                          <option value="Asia/Kuwait">Arabia Standard Time (AST)</option>
                          <option value="Asia/Qatar">Arabia Standard Time (AST)</option>
                          <option value="Asia/Bahrain">Arabia Standard Time (AST)</option>
                          <option value="Asia/Aden">Arabia Standard Time (AST)</option>
                          <option value="Asia/Amman">Eastern European Time (EET)</option>
                          <option value="Asia/Beirut">Eastern European Time (EET)</option>
                          <option value="Asia/Jerusalem">Israel Standard Time (IST)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                          <option value="UTC">Coordinated Universal Time (UTC)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hotel_currency" className="flex items-center gap-2 text-sm font-medium">
                          <Coins className="h-4 w-4 text-amber-700" />
                          Currency
                        </Label>
                        <select
                          id="hotel_currency"
                          value={hotelData.currency}
                          onChange={(e) => setHotelData({ ...hotelData, currency: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-white bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="SAR">Saudi Riyal (SAR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="AED">UAE Dirham (AED)</option>
                          <option value="QAR">Qatari Riyal (QAR)</option>
                          <option value="KWD">Kuwaiti Dinar (KWD)</option>
                          <option value="BHD">Bahraini Dinar (BHD)</option>
                          <option value="OMR">Omani Rial (OMR)</option>
                          <option value="JOD">Jordanian Dinar (JOD)</option>
                          <option value="GBP">British Pound (GBP)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hotel_logo_url" className="flex items-center gap-2 text-sm font-medium">
                        <Image className="h-4 w-4 text-amber-700" />
                        Logo URL
                      </Label>
                      <Input
                        id="hotel_logo_url"
                        type="url"
                        value={hotelData.logo_url}
                        onChange={(e) => setHotelData({ ...hotelData, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="border-white"
                      />
                      <p className="text-xs text-muted-foreground italic">
                        Enter the URL of your hotel logo image (optional)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="check_in_time" className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-amber-700" />
                          Check-in Time
                        </Label>
                        <Input
                          id="check_in_time"
                          type="time"
                          value={hotelData.check_in_time}
                          onChange={(e) => setHotelData({ ...hotelData, check_in_time: e.target.value })}
                          className="border-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="check_out_time" className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-amber-700" />
                          Check-out Time
                        </Label>
                        <Input
                          id="check_out_time"
                          type="time"
                          value={hotelData.check_out_time}
                          onChange={(e) => setHotelData({ ...hotelData, check_out_time: e.target.value })}
                          className="border-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.refresh()}
                      className="border-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}