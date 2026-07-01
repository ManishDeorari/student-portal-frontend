import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Phone, MapPin, Globe, Linkedin, MessageCircle, User } from "lucide-react";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function EditBasicInfoModal({ isOpen, onClose, currentProfile, onSave }) {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        whatsapp: "",
        linkedin: "",
        secondaryEmail: "",
        universityRollNumber: "",
        branch: "",
        section: "",
        position: "",
        department: "",
    });

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (currentProfile && isOpen) {
            setFormData({
                name: currentProfile.name || "",
                phone: currentProfile.phone || "",
                whatsapp: currentProfile.whatsapp || "",
                linkedin: currentProfile.linkedin || "",
                secondaryEmail: currentProfile.secondaryEmail || "",
                universityRollNumber: currentProfile.universityRollNumber || "",
                branch: currentProfile.branch || "",
                section: currentProfile.section || "",
                position: currentProfile.position || "",
                department: currentProfile.department || "",
            });

            if (currentProfile.address) {
                const parts = currentProfile.address.split(",").map(p => p.trim());
                if (parts.length === 3) {
                    const countries = Country.getAllCountries();
                    const c = countries.find(item => item.name === parts[2]);
                    if (c) {
                        setSelectedCountry(c.isoCode);
                        const states = State.getStatesOfCountry(c.isoCode);
                        const s = states.find(item => item.name === parts[1]);
                        if (s) {
                            setSelectedState(s.isoCode);
                            const cities = City.getCitiesOfState(c.isoCode, s.isoCode);
                            const city = cities.find(item => item.name === parts[0]);
                            if (city) setSelectedCity(city.name);
                        }
                    }
                }
            } else {
                setSelectedCountry("");
                setSelectedState("");
                setSelectedCity("");
            }
        }
    }, [currentProfile, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Input Locks
        if (name === "name" || name === "branch" || name === "position" || name === "department") {
            value = value.replace(/[^a-zA-Z\s\.\-']/g, '');
        } else if (name === "whatsapp" || name === "universityRollNumber") {
            value = value.replace(/\D/g, '');
        } else if (name === "section") {
            value = value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 5);
        } else if (name === "secondaryEmail") {
            value = value.toLowerCase().replace(/\s/g, '');
        } else if (name === "linkedin") {
            value = value.replace(/\s/g, '');
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phone: value }));
        if (errors.phone) {
            setErrors((prev) => ({ ...prev, phone: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        const WHATSAPP_REGEX = /^\d{7,15}$/;
        const URL_REGEX = /^(https?:\/\/)?([\w\d]+\.)?[\w\d]+\.\w+\/.*$/;
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = "Name is required.";
        
        if (currentProfile?.role === "student" && !formData.universityRollNumber.trim()) {
            newErrors.universityRollNumber = "Roll Number is required.";
        }
        
        if (currentProfile?.role === "faculty" || currentProfile?.role === "admin") {
            if (!formData.position.trim()) newErrors.position = "Position is required.";
            if (!formData.department.trim()) newErrors.department = "Department is required.";
        }

        if (!formData.phone || formData.phone.length < 7) {
            newErrors.phone = "Valid phone number is required.";
        }

        if (!formData.whatsapp || !WHATSAPP_REGEX.test(formData.whatsapp.replace(/\D/g, ""))) {
            newErrors.whatsapp = "Valid WhatsApp number is required.";
        }

        if (!formData.linkedin || !formData.linkedin.includes("linkedin.com") || !URL_REGEX.test(formData.linkedin)) {
            newErrors.linkedin = "Valid LinkedIn profile URL is required.";
        }

        if (!formData.secondaryEmail || !EMAIL_REGEX.test(formData.secondaryEmail)) {
            newErrors.secondaryEmail = "Valid email is required.";
        }
        
        if (!selectedCountry) newErrors.country = "Country is required.";
        if (!selectedState) newErrors.state = "State is required.";
        if (!selectedCity) newErrors.city = "City is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (loading) return;
        if (!validate()) {
            toast.error("Please fix errors before saving.");
            return;
        }

        setLoading(true);
        try {
            let fullAddress = "";
            if (selectedCountry && selectedState && selectedCity) {
                const cName = Country.getCountryByCode(selectedCountry)?.name;
                const sName = State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name;
                fullAddress = `${selectedCity}, ${sName}, ${cName}`;
            }

            const payload = {
                ...formData,
                phone: formData.phone.startsWith("+") ? formData.phone : `+${formData.phone}`,
                address: fullAddress
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update profile info");

            const updatedUser = await res.json();
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Profile details updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating profile details");
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
                <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                    <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <User className="w-5 h-5" /> Edit Personal Details
                            </h2>
                            <button onClick={onClose} className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className={`p-6 space-y-5 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                            {/* Name */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    <User className="w-3.5 h-3.5" /> Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.name ? 'from-red-500 to-red-600' : ''}`}>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.name}</p>}
                            </div>

                            {/* Secondary Email */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                    <Globe className="w-3.5 h-3.5" /> Secondary Email <span className="text-red-500">*</span>
                                </label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.secondaryEmail ? 'from-red-500 to-red-600' : ''}`}>
                                    <input
                                        type="email"
                                        name="secondaryEmail"
                                        value={formData.secondaryEmail}
                                        onChange={handleChange}
                                        placeholder="Backup Email Address"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                    />
                                </div>
                                {errors.secondaryEmail && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.secondaryEmail}</p>}
                            </div>

                            {/* University Roll Number */}
                            {currentProfile?.role === "student" && (
                                <>
                                    <div>
                                        <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>
                                            <User className="w-3.5 h-3.5" /> Univ Roll Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.universityRollNumber ? 'from-red-500 to-red-600' : ''}`}>
                                            <input
                                                type="text"
                                                name="universityRollNumber"
                                                value={formData.universityRollNumber}
                                                onChange={handleChange}
                                                placeholder="Enter Roll Number"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            />
                                        </div>
                                        {errors.universityRollNumber && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.universityRollNumber}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                Branch
                                            </label>
                                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                                <input
                                                    type="text"
                                                    name="branch"
                                                    value={formData.branch}
                                                    onChange={handleChange}
                                                    placeholder="E.g. Computer Science"
                                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                Section
                                            </label>
                                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                                <input
                                                    type="text"
                                                    name="section"
                                                    value={formData.section}
                                                    onChange={handleChange}
                                                    placeholder="E.g. A"
                                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {(currentProfile?.role === "faculty" || currentProfile?.role === "admin") && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>
                                            Position <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.position ? 'from-red-500 to-red-600' : ''}`}>
                                            <input
                                                type="text"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleChange}
                                                placeholder="E.g. Assistant Professor"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            />
                                        </div>
                                        {errors.position && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.position}</p>}
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>
                                            Department <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.department ? 'from-red-500 to-red-600' : ''}`}>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                placeholder="E.g. Computer Science"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            />
                                        </div>
                                        {errors.department && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.department}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Phone Number */}
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.phone ? 'from-red-500 to-red-600' : ''}`}>
                                        <PhoneInput
                                            country={"in"}
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            inputStyle={{
                                                width: '100%',
                                                height: '44px',
                                                borderRadius: 'calc(0.75rem - 2px)',
                                                border: 'none',
                                                background: darkMode ? '#121213' : '#ffffff',
                                                color: darkMode ? '#ffffff' : '#111827',
                                            }}
                                            buttonStyle={{
                                                border: 'none',
                                                borderRadius: 'calc(0.75rem - 2px) 0 0 calc(0.75rem - 2px)',
                                                background: darkMode ? '#121213' : '#ffffff',
                                            }}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.phone}</p>}
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.whatsapp ? 'from-red-500 to-red-600' : ''}`}>
                                        <input
                                            type="text"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                        />
                                    </div>
                                    {errors.whatsapp && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.whatsapp}</p>}
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-500' : 'text-blue-700'}`}>
                                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile <span className="text-red-500">*</span>
                                </label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.linkedin ? 'from-red-500 to-red-600' : ''}`}>
                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                    />
                                </div>
                                {errors.linkedin && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.linkedin}</p>}
                            </div>

                            {/* Address / Location */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    <MapPin className="w-3.5 h-3.5" /> Location <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.country ? 'from-red-500 to-red-600' : ''}`}>
                                            <select
                                                value={selectedCountry}
                                                onChange={(e) => {
                                                    setSelectedCountry(e.target.value);
                                                    setSelectedState("");
                                                    setSelectedCity("");
                                                    if(errors.country) setErrors(prev => ({...prev, country: null}));
                                                }}
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            >
                                                <option value="">Country</option>
                                                {Country.getAllCountries().map((c) => (
                                                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.state ? 'from-red-500 to-red-600' : ''}`}>
                                            <select
                                                value={selectedState}
                                                onChange={(e) => {
                                                    setSelectedState(e.target.value);
                                                    setSelectedCity("");
                                                    if(errors.state) setErrors(prev => ({...prev, state: null}));
                                                }}
                                                disabled={!selectedCountry}
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            >
                                                <option value="">State</option>
                                                {selectedCountry && State.getStatesOfCountry(selectedCountry).map((s) => (
                                                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors.city ? 'from-red-500 to-red-600' : ''}`}>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => {
                                                    setSelectedCity(e.target.value);
                                                    if(errors.city) setErrors(prev => ({...prev, city: null}));
                                                }}
                                                disabled={!selectedState}
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                            >
                                                <option value="">City</option>
                                                {selectedState && City.getCitiesOfState(selectedCountry, selectedState).map((city) => (
                                                    <option key={city.name} value={city.name}>{city.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {(errors.country || errors.state || errors.city) && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">Please select complete location</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`p-4 flex justify-end gap-3 flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-t border-white/5' : 'bg-gray-50 border-t'}`}>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${darkMode ? '#333' : '#d1d5db'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#555' : '#9ca3af'};
                }
            `}</style>
                </div>
            </div>
        </>
    );
}