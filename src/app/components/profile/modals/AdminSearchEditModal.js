




































































                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <div 
                                        key={u._id}
                                        onClick={() => onEditUser(u)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${darkMode ? "bg-white/5 border-white/5 hover:border-purple-500/50 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:border-purple-500/50 hover:bg-purple-50/50\