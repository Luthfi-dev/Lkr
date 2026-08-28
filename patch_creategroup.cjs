const fs = require('fs');
let code = fs.readFileSync('src/components/CreateGroupModal.tsx', 'utf8');

// We need to inject useState and useEffect for search.
// We'll add it right after `const [tagsInput, setTagsInput] = useState(...)`

const searchStateCode = `
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    if (!memberSearchQuery) {
      setDebouncedSearchQuery('');
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(memberSearchQuery);
      setIsSearching(false);
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  const filteredMembers = React.useMemo(() => {
    if (!debouncedSearchQuery) return [];
    const q = debouncedSearchQuery.toLowerCase();
    return allUsers.filter(u => {
      if (u.systemRole === 'superadmin' || u.systemRole === 'admin') return false;
      if (u.id === currentUser.id) return false;
      const matchName = u.name.toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchUsername || matchEmail;
    });
  }, [debouncedSearchQuery, allUsers, currentUser.id]);
`;

code = code.replace(
  "const [tagsInput, setTagsInput] = useState('kolaborasi, riset, produktivitas');",
  "const [tagsInput, setTagsInput] = useState('kolaborasi, riset, produktivitas');\n" + searchStateCode
);

const oldSearchUI = `<h3 className="text-xs font-bold text-slate-800 mb-1">
                  Pilih Anggota Tim & Tunjuk Pengelola Keuangan (Bendahara)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Anda otomatis menjadi Ketua/Admin grup. Pilih rekan untuk diajak bergabung serta tentukan siapa yang mengelola kas bersama.
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {availableUsers.map((u) => {`;

const newSearchUI = `<h3 className="text-xs font-bold text-slate-800 mb-1">
                  Pilih Anggota Tim & Tunjuk Pengelola Keuangan (Bendahara)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Anda otomatis menjadi Ketua/Admin grup. Cari anggota berdasarkan nama, username, atau email.
                </p>
                
                <div className="mb-3 relative">
                  <input
                    type="text"
                    placeholder="Ketik nama, username, atau email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {/* Show already selected users first even if they don't match search */}
                  {selectedUserIds.map(userId => {
                    const u = allUsers.find(x => x.id === userId);
                    if (!u) return null;
                    const isSelected = true;
                    const currentRole = memberRoles[u.id] || 'Anggota';
                    return (
                      <div
                        key={u.id}
                        className="p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 bg-white border-teal-400 shadow-xs"
                      >
                        <div
                          onClick={() => handleToggleUser(u.id)}
                          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                        >
                          <div
                            className="w-4 h-4 rounded border flex items-center justify-center bg-teal-600 border-teal-600 text-white"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{u.role}</div>
                          </div>
                        </div>
                        <select
                          value={currentRole}
                          onChange={(e) =>
                            handleSetRole(u.id, e.target.value as CircleMember['role'])
                          }
                          className="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-[11px] font-bold outline-none"
                        >
                          <option value="Bendahara">💰 Bendahara (Kas)</option>
                          <option value="Sekretaris">Sekretaris</option>
                          <option value="Anggota">Anggota</option>
                        </select>
                      </div>
                    );
                  })}

                  {!memberSearchQuery && selectedUserIds.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Ketik untuk mencari anggota
                    </div>
                  )}
                  {memberSearchQuery && !isSearching && filteredMembers.length === 0 && selectedUserIds.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Tidak ada anggota yang cocok
                    </div>
                  )}

                  {filteredMembers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    if (isSelected) return null; // already shown above
                    const currentRole = memberRoles[u.id] || 'Anggota';`;

code = code.replace(oldSearchUI, newSearchUI);
// Note: we replaced `{availableUsers.map((u) => {`. We need to fix `u.roleTitle` to `u.role` in the old map to avoid TS errors.
code = code.replace(/\{u\.roleTitle\}/g, '{u.role}');
fs.writeFileSync('src/components/CreateGroupModal.tsx', code);
