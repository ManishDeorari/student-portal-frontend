













        if (currentProfile) {
            setWorkProfile(currentProfile.workProfile || {});
            setJobPreferences(currentProfile.jobPreferences || {});
            setSkills(currentProfile.skills ? currentProfile.skills.join(", ") : "");
        }
    }, [currentProfile]);

    if (!isOpen) return null;

    const handleWorkChange = (field, value) => {
        setWorkProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleJobChange = (field, value) => {
        setJobPreferences((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocationsChange = (value) => {
        const locations = value.split(",").map((loc) => loc.trim());
        setJobPreferences((prev) => ({ ...prev, preferredLocations: locations }));
    };

    const handleSave = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

            const updateData = {
                workProfile,
                jobPreferences,




            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) throw new Error("Failed to update job info");

            const updatedUser = await res.json();
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Job Info updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating job info");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Edit Job Info & Skills
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                    {/* Work Profile Section */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            <Settings className="w-4 h-4" /> Current Work Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Functional Area", field: "functionalArea", target: "work" },
                                { label: "Sub-Functional Area", field: "subFunctionalArea", target: "work" },
                                { label: "Experience", field: "experience", target: "work" },
                                { label: "Industry", field: "industry", target: "work" }
                            ].map((item) => (
                                <div key={item.field}>
                                    <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {item.label}
                                    </label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                        <input
                                            type="text"
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                            value={workProfile[item.field] || "\