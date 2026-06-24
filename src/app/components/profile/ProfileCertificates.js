import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditCertificatesModal from "./modals/EditCertificatesModal";
import ImageViewerModal from "./ImageViewerModal";
import { Award, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileCertificates({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProofImage, setSelectedProofImage] = useState(null);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            certificates: updatedUser.certificates,
        }));
    };

    return (
        <>
            <SectionCard
                title="Certificates"
                hasData={profile.certificates?.length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                <div className="space-y-8">
                    {(() => {
                        const sortedCertificates = profile.certificates?.slice().sort((a, b) => {
                            const dateA = new Date(a.issueDate);
                            const dateB = new Date(b.issueDate);
                            return dateB - dateA; // Newest first
                        }) || [];

                        return sortedCertificates.map((cert, idx) => {
                            return (
                                <div key={idx} className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full mb-6 transition-all duration-300 hover:scale-[1.02] hover:z-20 relative">
                                <div className={`p-5 rounded-[calc(2.5rem-2.5px)] flex gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                                    {/* Logo Placeholder */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-blue-900/30 shadow-none' : 'bg-blue-50 shadow-sm'}`}>
                                            <ShieldCheck className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-2.5">
                                        <div className="flex flex-col">
                                            <h3 className={`text-base font-black leading-tight flex items-center gap-2 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600'}`}>
                                                {cert.name}
                                            </h3>
                                            <p className={`text-sm font-black mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                                {cert.issuer}
                                            </p>
                                        </div>

                                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            Issued: {cert.issueDate}
                                            {cert.duration && (
                                                <>
                                                    <span className={`mx-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>•</span>
                                                    Duration: {cert.duration}
                                                </>
                                            )}
                                        </div>

                                        {cert.description && (
                                            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cert.description}
                                            </p>
                                        )}

                                        {/* Optional Credential URL */}
                                        {cert.credentialUrl && (
                                            <div className="pt-1">
                                                <a 
                                                    href={cert.credentialUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> Verify Credential
                                                </a>
                                            </div>
                                        )}

                                        {/* Proof Image visible to owner or admin/faculty */}
                                        {cert.proofImage && (
                                            <div className="mt-3 pt-2">
                                                {(!isPublicView || (typeof window !== "undefined" && ["admin", "faculty"].includes(JSON.parse(localStorage.getItem("user") || "{}")?.role))) ? (
                                                    <button 
                                                        onClick={() => setSelectedProofImage(cert.proofImage)}
                                                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border ${darkMode ? 'text-pink-400 border-pink-400/30 hover:bg-pink-400/10' : 'text-pink-600 border-pink-200 hover:bg-pink-50'}`}
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> View Proof Image
                                                    </button>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })})()}
                </div>

                {(!profile.certificates || profile.certificates.length === 0) && (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Award className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No certificates added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditCertificatesModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentCertificates={profile.certificates || []}
                onSave={handleSave}
            />

            {/* ImageViewerModal for Proof Image */}
            {selectedProofImage && (
                <ImageViewerModal
                    imageUrl={selectedProofImage}
                    onClose={() => setSelectedProofImage(null)}
                    isRestricted={false}
                    downloadName={`${profile?.name?.replace(/\s+/g, '_') || "User"}_Certificate_Proof.jpg`}
                />
            )}
        </>
    );
}
