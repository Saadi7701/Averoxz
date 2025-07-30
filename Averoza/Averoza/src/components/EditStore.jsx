import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EditStore = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    // image: "",
    // banner: "",
    themeColor: "",
    fontStyle: "",
    customCSS: "",
  });
  const [profilePreview, setProfilePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!user.token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    const fetchStoreId = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/stores/my-store-id",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setStoreId(res.data.storeId);
      } catch (err) {
        setStoreId("");
      }
    };

    fetchStoreId();

    const fetchStore = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/stores/my-store",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setStore(res.data.store);
        setForm({
          name: res.data.store.name || "",
          description: res.data.store.description || "",
          themeColor: res.data.store.themeColor || "",
          fontStyle: res.data.store.fontStyle || "",
          customCSS: res.data.store.customCSS || "",
        });
        setProfilePreview(
          res.data.store._id
            ? `http://localhost:5000/api/stores/${res.data.store._id}/image?${Date.now()}`
            : ""
        );
        setBannerPreview(
          res.data.store._id
            ? `http://localhost:5000/api/stores/${res.data.store._id}/banner?${Date.now()}`
            : ""
        );
      } catch (err) {
        setError("Failed to load store info");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [user]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfileFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBannerPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (profileFile) {
        const formData = new FormData();
        formData.append("image", profileFile);
        formData.append("type", "image");
        await axios.post(
          "http://localhost:5000/api/stores/upload-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (bannerFile) {
        const formData = new FormData();
        formData.append("image", bannerFile);
        formData.append("type", "banner");
        await axios.post(
          "http://localhost:5000/api/stores/upload-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      await axios.put(
        "http://localhost:5000/api/stores",
        {
          name: form.name,
          description: form.description,
          themeColor: form.themeColor,
          fontStyle: form.fontStyle,
          customCSS: form.customCSS,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate("/vendor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update store");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18181b]">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4 gap-2">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow"
            onClick={() => navigate("/vendor-dashboard")}
            type="button"
          >
            Back to Dashboard
          </Button>
          <Button
            className="bg-[#23232b] border border-white/20 text-white font-semibold rounded-lg shadow hover:bg-[#23232b]/80"
            onClick={() => storeId && navigate(`/store/${storeId}`)}
            type="button"
            disabled={!storeId}
          >
            View Store
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Edit store</h1>
        <p className="text-white/60 mb-8">
          Update your store's name, description, and images.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <Label htmlFor="name" className="text-white mb-2 block">
              Store name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="bg-[#23232b] border-none text-white placeholder-white/40 text-lg py-4"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white mb-2 block">
              Store description
            </Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="bg-[#23232b] border-none text-white placeholder-white/40 text-lg py-4 w-full rounded-xl min-h-[120px]"
              required
            />
          </div>

          {/* New Theme Fields */}
          <div>
            <Label htmlFor="themeColor" className="text-white mb-2 block">
              Theme Color
            </Label>
            <Input
              id="themeColor"
              name="themeColor"
              value={form.themeColor}
              onChange={handleInputChange}
              placeholder="e.g., #6b21a8"
              className="bg-[#23232b] border-none text-white placeholder-white/40 py-4"
            />
          </div>

          <div>
            <Label htmlFor="fontStyle" className="text-white mb-2 block">
              Font Style
            </Label>
            <Input
              id="fontStyle"
              name="fontStyle"
              value={form.fontStyle}
              onChange={handleInputChange}
              placeholder="e.g., 'Poppins, sans-serif'"
              className="bg-[#23232b] border-none text-white placeholder-white/40 py-4"
            />
          </div>

          <div>
            <Label htmlFor="customCSS" className="text-white mb-2 block">
              Custom CSS
            </Label>
            <textarea
              id="customCSS"
              name="customCSS"
              value={form.customCSS}
              onChange={handleInputChange}
              className="bg-[#23232b] border-none text-white placeholder-white/40 text-sm py-2 w-full rounded-xl min-h-[80px]"
              placeholder="You can write custom styles here..."
            />
          </div>

          {/* Image Uploads */}
          <div>
            <h3 className="text-white font-semibold mb-4">Store images</h3>
            <div className="flex items-center gap-8 mb-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-[#23232b] flex items-center justify-center">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/40">No Image</span>
                  )}
                </div>
                <span className="text-white/80 text-xs mb-1">
                  Profile image
                </span>
                <span className="text-white/40 text-xs mb-2">
                  Recommended: 500x500
                </span>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#23232b] text-white border border-white/20 hover:bg-[#23232b]/80 mb-2"
                >
                  <label>
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileChange}
                    />
                  </label>
                </Button>
              </div>

              {/* Banner */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 bg-[#23232b] flex items-center justify-center">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/40">No Image</span>
                  )}
                </div>
                <span className="text-white/80 text-xs mb-1">Banner</span>
                <span className="text-white/40 text-xs mb-2">
                  Recommended: 1200x300
                </span>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#23232b] text-white border border-white/20 hover:bg-[#23232b]/80 mb-2"
                >
                  <label>
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerChange}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="ghost"
              className="bg-[#23232b] text-white"
              onClick={() => navigate("/vendor-dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStore;
