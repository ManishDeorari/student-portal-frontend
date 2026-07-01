










































































































































        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.secure_url) {
          toast.error("❌ Upload to Cloudinary failed.");
          return;
        }
        uploadedUrl = uploadJson.secure_url;
      }

      const updatePayload = {
        bannerImageFocus: bannerImageFocus || undefined
      };
      
      if (uploadedUrl) {
        updatePayload.bannerImage = uploadedUrl;
        updatePayload.oldImageUrl = latestBanner && !latestBanner.includes("default_banner.jpg") ? latestBanner : null;
      }

      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatePayload),
      });

      if (!backendRes.ok) {
        toast.error("❌ Failed to update banner in backend.");
        return;
      }

      if (typeof onUploaded === "function") onUploaded(uploadedUrl || latestBanner);

      if (uploadedUrl && latestBanner && !latestBanner.includes("default_banner.jpg")) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-old-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageUrl: latestBanner }),
        }).catch((err) => console.warn("⚠ Failed to delete old banner:", err));
      }

      toast.success("✅ Banner updated!");
      setSelectedFile(null);