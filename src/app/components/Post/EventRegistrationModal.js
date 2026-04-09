"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { registerForEvent } from "../../../api/dashboard";

const EventRegistrationModal = ({ event, isOpen, onClose, currentUser, darkMode = false, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isGroup, setIsGroup] = useState(event.allowGroupRegistration);
  const [answers, setAnswers] = useState({});

  // Sync state whenever event or isOpen changes
  useEffect(() => {
    if (isOpen && event.myRegistration) {
      // 1. Hydrate Group Members
      if (event.myRegistration.isGroup && event.myRegistration.groupMembers) {
        setGroupMembers(event.myRegistration.groupMembers);
      } else {
        setGroupMembers([]);
      }

      // 2. Hydrate Answers
      const regAnswers = event.myRegistration.answers;
      let baseAnswers = {};
      if (regAnswers) {
        // Since we now use flattenMaps: true on backend, it should usually arrive as an object,
        // but we handle Map just in case for older data or different serialization.
        baseAnswers = (regAnswers instanceof Map || typeof regAnswers.get === 'function')
          ? Object.fromEntries(regAnswers)
          : regAnswers;
      }

      // Merge with currentUser defaults if needed
      const initial = { ...baseAnswers };
      if (event.registrationFields) {
        Object.keys(event.registrationFields).forEach(field => {
          if (event.registrationFields[field] && initial[field] === undefined) {
             initial[field] = currentUser?.[field] || "";
          }
        });
      }
      setAnswers(initial);
      setIsGroup(event.allowGroupRegistration || event.myRegistration.isGroup);
    } else if (isOpen && !event.myRegistration) {
      // Reset for fresh registration
      const initial = {};
      if (event.registrationFields) {
        Object.keys(event.registrationFields).forEach(field => {
           if (event.registrationFields[field]) {
             initial[field] = currentUser?.[field] || "";
           }
        });
      }
      setAnswers(initial);
      setGroupMembers([]);
      setIsGroup(event.allowGroupRegistration);
    }
  }, [isOpen, event._id, event.myRegistration, currentUser]);

  if (!isOpen) return null;

  const handleMemberChange = (index, field, value) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  const addMember = () => {
    if (groupMembers.length < 3) { // Total 4 (1 + 3)
      const newMember = {};
      if (event.registrationFields) {
        Object.keys(event.registrationFields).forEach(f => {
          if (event.registrationFields[f]) {
            newMember[f === "phoneNumber" || f === "mobileNumber" ? "mobile" : f] = "";
          }
        });
      }
      if (event.customQuestions) {
        event.customQuestions.forEach(q => {
          newMember[q.question] = "";
        });
      }
      setGroupMembers([...groupMembers, newMember]);
    }
  };

  const removeMember = (index) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = [];
    if (event.registrationFields) {
      Object.keys(event.registrationFields).forEach(field => {
        if (event.registrationFields[field] && !answers[field]) {
          newErrors.push(field);
        }
      });
    }
    if (event.customQuestions) {
      event.customQuestions.forEach(q => {
        if (!answers[q.question]) newErrors.push(q.question);
      });
    }
    if (isGroup) {
      groupMembers.forEach((member, idx) => {
        if (event.registrationFields) {
          Object.keys(event.registrationFields).forEach(f => {
            if (event.registrationFields[f]) {
              const key = (f === "phoneNumber" || f === "mobileNumber") ? "mobile" : f;
              if (!member[key]) newErrors.push(`group_${idx}_${key}`);
            }
          });
        }
        if (event.customQuestions) {
          event.customQuestions.forEach(q => {
            if (!member[q.question]) newErrors.push(`group_${idx}_${q.question}`);
          });
        }
      });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("❌ Please fill in all required fields.");
      return;
    }
    setErrors([]);

    setLoading(true);
    try {
      const payload = {
        eventId: event._id,
        isGroup,
        groupMembers: isGroup ? groupMembers : [],
        answers
      };

      const result = await registerForEvent(payload);
      if (result.registration) {
        toast.success("🎉 Registration successful!");
        if (onRegisterSuccess) {
           onRegisterSuccess(result.registration);
        }
        onClose();
      } else {
        if (result.message && result.message.toLowerCase().includes("not found")) {
            toast.error("❌ Event not found! It may have been deleted.");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            toast.error(result.message || "❌ Registration failed.");
        }
      }
    } catch (err) {
      toast.error("❌ An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorClass = (field) => {
    return errors.includes(field)
      ? "flex-1 p-[1.5px] rounded-xl bg-red-500 focus-within:ring-2 focus-within:ring-red-400 shadow-lg animate-pulse transition-all leading-none"
      : "flex-1 p-[1.5px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 focus-within:ring-2 focus-within:ring-purple-400 transition-all leading-none";
  };

  const getBaseErrorClass = (field, isGroup = false) => {
     return errors.includes(field)
      ? `p-[1.5px] ${isGroup ? 'rounded-lg' : 'rounded-xl'} bg-red-500 focus-within:ring-2 focus-within:ring-red-400 shadow-lg animate-pulse transition-all`
      : `p-[1.5px] ${isGroup ? 'rounded-lg' : 'rounded-xl'} bg-gradient-to-r from-blue-500 to-purple-600 focus-within:ring-2 focus-within:ring-purple-400 transition-all`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`p-[1.5px] rounded-2xl sm:rounded-[2.1rem] bg-gradient-to-tr from-blue-500 to-purple-600 w-full max-w-xl my-auto shadow-2xl transition-all max-h-[95dvh] sm:max-h-[90vh]`}>
        <div className={`relative w-full h-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-xl sm:rounded-[2rem] overflow-hidden`}>
          <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <h2 className={`text-base sm:text-xl font-black ${darkMode ? "text-white" : "text-black"}`}>Register for Event</h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500">&times;</button>
          </div>

          <form onSubmit={handleRegister} className="p-4 sm:p-8 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className={`font-bold ${darkMode ? "text-white" : "text-black"}`}>Event: {event.title}</h3>
            
           {/* Group Member Logic: If it's a group event, we don't show the check box, it's mandatory if they want to add more */}
           {event.allowGroupRegistration && (
             <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-600/20">
               <div className={`flex items-center justify-between p-4 ${darkMode ? "bg-slate-800" : "bg-blue-50/20"} rounded-[15px]`}>
                  <span className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Group Event Policy Enabled</span>
                  <button type="button" onClick={addMember} disabled={groupMembers.length >= 3} className={`px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest ${groupMembers.length >= 3 ? "opacity-30" : "hover:bg-blue-700 active:scale-95 transition-all shadow-lg"}`}>+ Add Member</button>
               </div>
             </div>
           )}

           <div className="p-[1.2px] rounded-[2rem] bg-gradient-to-r from-blue-500/30 to-purple-600/30">
             <div className={`p-6 rounded-[calc(2rem-1.2px)] ${darkMode ? "bg-[#121213]" : "bg-gray-50/50"} space-y-6 shadow-sm`}>
                <div className="flex justify-between items-center px-1">
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Member 1 (Registrant)</h4>
                  <span className={`text-[9px] font-black uppercase ${darkMode ? "text-white" : "text-black"}`}>Headcount +1</span>
                </div>

            {/* Base Registration Fields (Registrant) */}
            {event.registrationFields && Object.keys(event.registrationFields).map(field => {
              if (!event.registrationFields[field]) return null;
              
              const isPhone = field === "phoneNumber" || field === "mobileNumber";
              
              return (
                <div key={field} className="space-y-1">
                  <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-black"} ${errors.includes(field) ? "text-red-500" : ""}`}>
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  
                  {isPhone ? (
                    <div className="flex gap-2">
                       <div className="p-[2px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                          <div className={`p-3 rounded-[10px] h-full flex items-center justify-center font-bold ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} `}>
                            +91
                          </div>
                       </div>
                       <div className={getErrorClass(field)}>
                        <input
                          type="tel"
                          maxLength={10}
                          pattern="\d{10}"
                          placeholder="10-digit number"
                          value={answers[field] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            handleAnswerChange(field, val);
                            setErrors(prev => prev.filter(err => err !== field));
                          }}
                          className={`w-full p-3 h-full rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={getBaseErrorClass(field)}>
                      <input
                        value={answers[field] || ""}
                        readOnly={['name', 'email', 'enrollmentnumber'].includes(field.toLowerCase())}
                        onChange={(e) => { handleAnswerChange(field, e.target.value); setErrors(prev => prev.filter(err => err !== field)); }}
                        className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none ${['name', 'email', 'enrollmentnumber'].includes(field.toLowerCase()) ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Questions (Registrant) */}
            {event.customQuestions?.map((q, i) => (
              <div key={i} className="space-y-1">
                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-black"} ${errors.includes(q.question) ? "text-red-500" : ""}`}>{q.question}</label>
                <div className={getBaseErrorClass(q.question)}>
                  <input
                    placeholder="Your answer..."
                    className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none placeholder-gray-500`}
                    value={answers[q.question] || ""}
                    onChange={(e) => { handleAnswerChange(q.question, e.target.value); setErrors(prev => prev.filter(err => err !== q.question)); }}
                  />
                </div>
              </div>
            ))}
            </div>
           </div>

            {isGroup && groupMembers.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] text-center ${darkMode ? "text-white" : "text-black"}`}>Group Members Details</h4>
                {groupMembers.map((member, idx) => (
                  <div key={idx} className="p-[1.2px] rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-purple-600/20 shadow-sm">
                    <div className={`p-6 rounded-[calc(2rem-1.2px)] ${darkMode ? "bg-[#121213]" : "bg-blue-50/10"} space-y-6`}>
                      <div className="flex justify-between items-center px-2">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Member {idx + 2}</span>
                        <button type="button" onClick={() => removeMember(idx)} className="text-red-500 text-[9px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Remove Member</button>
                      </div>

                    {/* All dynamic fields for members */}
                    {event.registrationFields && Object.keys(event.registrationFields).map(field => {
                        if (!event.registrationFields[field]) return null;
                        const isPhone = field === "phoneNumber" || field === "mobileNumber";
                        const key = isPhone ? "mobile" : field;
                        const errorKey = `group_${idx}_${key}`;

                        return (
                            <div key={field} className="space-y-1 px-2">
                                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-black"} ${errors.includes(errorKey) ? "text-red-500" : ""}`}>
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                {isPhone ? (
                                    <div className="flex gap-2">
                                        <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                                            <div className={`p-3 rounded-[10px] h-full flex items-center justify-center font-black text-xs ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"}`}>+91</div>
                                        </div>
                                        <div className={getErrorClass(errorKey)}>
                                            <input 
                                                type="tel"
                                                maxLength={10}
                                                pattern="\d{10}"
                                                placeholder="10-digit number"
                                                className={`w-full p-3 h-full rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                                                value={member[key] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                    handleMemberChange(idx, key, val);
                                                    setErrors(prev => prev.filter(err => err !== errorKey));
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={getBaseErrorClass(errorKey)}>
                                        <input 
                                            className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                                            value={member[key] || ""}
                                            onChange={(e) => {
                                                handleMemberChange(idx, key, e.target.value);
                                                setErrors(prev => prev.filter(err => err !== errorKey));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {event.customQuestions?.map((q) => {
                        const errorKey = `group_${idx}_${q.question}`;
                        return (
                            <div key={q.question} className="space-y-1 px-2">
                                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-black"} ${errors.includes(errorKey) ? "text-red-500" : ""}`}>{q.question}</label>
                                <div className={getBaseErrorClass(errorKey)}>
                                    <input 
                                        placeholder="Your answer..."
                                        className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none placeholder-gray-500`}
                                        value={member[q.question] || ""}
                                        onChange={(e) => {
                                            handleMemberChange(idx, q.question, e.target.value);
                                            setErrors(prev => prev.filter(err => err !== errorKey));
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all ${loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl active:scale-95"}`}
          >
            {loading ? "Registering..." : "Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default EventRegistrationModal;
