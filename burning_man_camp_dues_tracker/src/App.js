import React, { useState } from 'react';
import './App.css';

// === COLOR THEME ===
const COLORS = {
  primary: '#243dff',
  secondary: '#e70aeb',
  accent: '#1dcffc',
  bg: '#f5f7fa',
  text: '#232323',
  card: '#ffffff',
  warning: '#ffba08',
  success: '#36e68f',
};

// === MOCK DATA MODELS ===
// In a real app, use backend. For demo/persistence-free operation, local state only.
const DEFAULT_DUES = 250;

function generateInitialMembers() {
  return [
    {
      id: 1,
      name: 'Alice Burner',
      due: DEFAULT_DUES,
      dueDate: '2024-08-15',
      payments: [{ amount: 100, date: '2024-04-16' }],
    },
    {
      id: 2,
      name: 'Bob Playa',
      due: DEFAULT_DUES,
      dueDate: '2024-08-15',
      payments: [{ amount: 250, date: '2024-05-08' }],
    },
    {
      id: 3,
      name: 'Carmen Dust',
      due: DEFAULT_DUES,
      dueDate: '2024-08-15',
      payments: [],
    },
  ];
}

// === HELPERS ===
function calcPaid(payments) {
  return payments.reduce((acc, cur) => acc + Number(cur.amount), 0);
}
function calcBalance(due, payments) {
  return due - calcPaid(payments);
}

function toDollars(val) {
  if (!val && val !== 0) return '';
  return `$${Number(val).toLocaleString()}`;
}

// === MAIN CONTAINER ===
// PUBLIC_INTERFACE
function App() {
  // --- Application State ---
  // Mode: 'admin' | 'member' | null
  const [portal, setPortal] = useState(null);
  // Admin "login": no auth, use pseudo-login
  const [isAdmin, setIsAdmin] = useState(false);
  // Member selected in member portal
  const [memberViewId, setMemberViewId] = useState(null);

  // Main data: up to 80 members
  const [members, setMembers] = useState(generateInitialMembers);
  // For new member creation, edit, payment
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null for add, or member object
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingMember, setPayingMember] = useState(null);

  // --- App Bar / Navigation ---
  function handleLogout() {
    setPortal(null);
    setIsAdmin(false);
    setMemberViewId(null);
  }

  // --- Admin Portal: Add/Edit/Remove Members & Dues ---
  function openEditMember(member) {
    setEditingMember(member);
    setShowMemberDialog(true);
  }
  function openAddMember() {
    setEditingMember(null);
    setShowMemberDialog(true);
  }

  function saveMember(memberData) {
    if (editingMember) {
      // Edit existing
      setMembers(members =>
        members.map(m =>
          m.id === editingMember.id ? { ...m, ...memberData } : m
        )
      );
    } else {
      // Add new
      if (members.length >= 80) {
        alert('Maximum of 80 camp members reached.');
        setShowMemberDialog(false);
        setEditingMember(null);
        return;
      }
      const maxId = members.length === 0 ? 1 : Math.max(...members.map(m => m.id));
      setMembers(members => [
        ...members,
        {
          id: maxId + 1,
          ...memberData,
          payments: [],
        },
      ]);
    }
    setShowMemberDialog(false);
    setEditingMember(null);
  }

  function deleteMember(memberId) {
    if (
      window.confirm(
        'Are you sure you want to remove this member? This cannot be undone.'
      )
    ) {
      setMembers(members => members.filter(m => m.id !== memberId));
    }
  }

  function setCampDues(amount, date) {
    setMembers(members =>
      members.map(m => ({
        ...m,
        due: amount,
        dueDate: date,
      }))
    );
  }

  // --- Payment Recording ---
  function openRecordPayment(member) {
    setPayingMember(member);
    setShowPaymentDialog(true);
  }
  function addPayment({ memberId, amount, date }) {
    setMembers(members =>
      members.map(m =>
        m.id === memberId
          ? { ...m, payments: [...m.payments, { amount: Number(amount), date }] }
          : m
      )
    );
    setShowPaymentDialog(false);
    setPayingMember(null);
  }

  // --- UI: Responsive Style & Festive visual ---
  // Inject theme CSS variables
  React.useEffect(() => {
    document.body.style.background = COLORS.bg;
    document.body.style.color = COLORS.text;
  }, []);

  // --- MAIN RENDER ---
  return (
    <div
      className="app"
      style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Quicksand', 'Helvetica', 'Arial', sans-serif" }}
    >
      {/* NAVBAR */}
      <nav style={{
        background: `linear-gradient(90deg, ${COLORS.primary} 70%, ${COLORS.secondary})`,
        color: '#fff',
        padding: '18px 0',
        marginBottom: 0,
        fontWeight: 600,
        letterSpacing: '0.5px',
        boxShadow: '0 0 6px #1a0c55, 0 6px 32px 0 #e70aeb55',
        zIndex: 1000,
        position: 'sticky',
        top: 0,
      }}>
        <div className="container" style={{
          maxWidth: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: "'Creepster',cursive",
            fontSize: '1.8rem',
            color: '#fff',
            letterSpacing: '2px',
            textShadow: `2px 2px 0 ${COLORS.secondary}`,
            display: 'inline-flex',
            gap: 8,
            alignItems: 'center'
          }}>
            <span style={{
              color: COLORS.accent,
              fontSize: '2.1rem',
              marginRight: 2,
            }}>🔥</span>
            Burning Man Camp Dues
          </span>
          {/* Switch portals */}
          <span>
            {portal === null && (
              <>
                <button
                  className="btn"
                  style={btnStyle(COLORS.primary, COLORS.secondary)}
                  onClick={() => { setPortal('admin'); setIsAdmin(true); }}>
                  Admin Login
                </button>
                <button
                  className="btn"
                  style={btnStyle(COLORS.secondary, COLORS.primary, { marginLeft: 14 })}
                  onClick={() => setPortal('member')}>
                  Member Portal
                </button>
              </>
            )}
            {(portal === 'admin' || portal === 'member') && (
              <button
                className="btn"
                style={btnStyle(COLORS.accent, '#eee', { marginLeft: 14 })}
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </span>
        </div>
      </nav>

      <main className="container" style={{ maxWidth: 1000, padding: '32px 0' }}>
        {/* No portal selected: Splash screen */}
        {portal === null && (
          <FestiveIntro />
        )}

        {/* === ADMIN PORTAL === */}
        {portal === 'admin' && (
          <>
            <h2 style={{ margin: '32px 0 14px 0', color: COLORS.primary, fontWeight: 800, fontSize: '2.4rem', letterSpacing: '1.5px', textShadow: `2px 2px ${COLORS.secondary}88` }}>
              Admin Dashboard
            </h2>
            <AdminDuesSummary
              members={members}
              primary={COLORS.primary}
              accent={COLORS.accent}
            />

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 32, gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={btnStyle(COLORS.primary, '#fff')}
                onClick={openAddMember}
              >
                + Add Member
              </button>
              <SetCampDuesForm
                onSet={setCampDues}
                accent={COLORS.accent}
                secondary={COLORS.secondary}
              />
            </div>
            <MemberTable
              members={members}
              isAdmin={true}
              onEdit={openEditMember}
              onDelete={deleteMember}
              onRecordPayment={openRecordPayment}
              accent={COLORS.accent}
            />
          </>
        )}

        {/* === MEMBER PORTAL === */}
        {portal === 'member' && (
          <>
            <h2 style={{
              margin: '38px 0 18px 0',
              color: COLORS.secondary, fontWeight: 800, fontSize: '2.1rem',
              textShadow: `2px 2px ${COLORS.accent}`
            }}>
              Member Portal
            </h2>

            {memberViewId === null ? (
              <MemberLoginSelector
                members={members}
                setMemberViewId={setMemberViewId}
                accent={COLORS.accent}
              />
            ) : (
              <MemberInfoView
                member={members.find(m => m.id === memberViewId)}
                close={() => setMemberViewId(null)}
              />
            )}
          </>
        )}
      </main>

      {/* === Pop-up Dialogs === */}
      {showMemberDialog && (
        <MemberEditDialog
          initialMember={editingMember}
          onSave={saveMember}
          onCancel={() => { setShowMemberDialog(false); setEditingMember(null); }}
          accent={COLORS.accent}
        />
      )}

      {showPaymentDialog && (
        <PaymentDialog
          member={payingMember}
          onSave={addPayment}
          onCancel={() => { setShowPaymentDialog(false); setPayingMember(null); }}
          accent={COLORS.accent}
          warning={COLORS.warning}
        />
      )}

      {/* === FESTIVE FOOTER === */}
      <div style={{
        marginTop: 28, color: COLORS.secondary,
        fontWeight: 600, textAlign: 'center', fontSize: 18,
        opacity: 0.8, paddingBottom: 16
      }}>
        <FestiveSparkle /> Made with <span style={{ color: COLORS.primary }}>🫶</span> for the Playa
      </div>
    </div>
  );
}

// ================== COMPONENTS ==================
// === FESTIVE SPLASH ===
function FestiveIntro() {
  return (
    <section style={{
      marginTop: 60,
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ fontSize: 42, fontWeight: 700, color: '#e70aeb', letterSpacing: '1.5px', marginBottom: 10 }}>
        <span style={{ color: '#243dff', fontSize: 60 }}>🔥</span>
        Burning Man Camp Dues Tracker
      </div>
      <div style={{ color: '#1dcffc', fontSize: 20, marginBottom: 6 }}>
        Festive, vibrant, and simple dues management for your camp!
      </div>
      <div
        style={{
          maxWidth: 480,
          color: '#333',
          background: 'rgba(255,255,255,0.99)',
          border: '2px solid #e70aeb',
          borderRadius: 18,
          boxShadow: '0 4px 24px #e70aeb33',
          margin: '23px auto 0 auto',
          padding: '26px 25px',
          textAlign: 'center',
          fontSize: 18
        }}>
        <p>
          <strong>Track dues, payments, and members with ease!</strong>
        </p>
        <ul style={{ listStyle: '💃', paddingLeft: 28, textAlign: 'left' }}>
          <li>Add, edit, and remove camp members (up to 80)</li>
          <li>Set or update dues/due dates for all or individual members</li>
          <li>Record payments and track balances</li>
          <li>Member portal to view your payments</li>
          <li>Admin dashboard summary</li>
        </ul>
      </div>
      <div style={{
        margin: '42px 0', fontSize: 30, color: '#e70aeb'
      }}>
        <FestiveSparkle amount={7} />
      </div>
    </section>
  );
}

// === ADMIN: Due summary chart ===
function AdminDuesSummary({ members, primary, accent }) {
  const total = members.reduce((s, m) => s + m.due, 0);
  const paid = members.reduce((s, m) => s + calcPaid(m.payments), 0);
  const balance = total - paid;
  const paidPct = total === 0 ? 0 : ((paid / total) * 100).toFixed(1);
  return (
    <div style={{
      background: `linear-gradient(60deg, ${primary} 85%, ${accent} 120%)`,
      color: '#fff', borderRadius: 16,
      padding: '22px 28px',
      display: 'flex', flexWrap: 'wrap', gap: 36,
      fontSize: 22, alignItems: 'flex-end',
      boxShadow: `0 5px 24px #0d083360`,
      margin: '6px 0 18px 0'
    }}>
      <div>
        <div>Total Dues Owed:</div>
        <div style={{ fontWeight: 700, fontSize: 28, marginTop: 2 }}>{toDollars(total)}</div>
      </div>
      <div>
        <div>Paid:</div>
        <div style={{ fontWeight: 700, fontSize: 28, marginTop: 2 }}>{toDollars(paid)}</div>
      </div>
      <div>
        <div>Outstanding Balance:</div>
        <div style={{
          fontWeight: 700,
          fontSize: 28,
          marginTop: 2,
          color: balance > 0 ? '#ffe140' : '#36e68f'
        }}>{toDollars(balance)}</div>
      </div>
      <div>
        <div>% Paid:</div>
        <div style={{ fontWeight: 700, fontSize: 28, marginTop: 2 }}>{paidPct}%</div>
      </div>
    </div>
  );
}

// === MEMBER TABLE for ADMIN ===
function MemberTable({ members, isAdmin, onEdit, onDelete, onRecordPayment, accent }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 15,
      marginTop: 26,
      boxShadow: '0 4px 20px #243dff11',
      overflow: 'auto',
      fontSize: 16,
      border: '2px solid #e70aeb31',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'none',
      }}>
        <thead>
          <tr style={{
            background: 'linear-gradient(90deg, #e70aeb11 90%, #243dff11)',
            color: '#243dff'
          }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Due</th>
            <th style={thStyle}>Due Date</th>
            <th style={thStyle}>Paid</th>
            <th style={thStyle}>Balance</th>
            {isAdmin && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr><td colSpan={isAdmin ? 7 : 6} style={{ padding: 36, textAlign: 'center' }}>No members yet!</td></tr>
          ) : members.map((m, idx) => {
            const balance = calcBalance(m.due, m.payments);
            return (
              <tr key={m.id} style={{
                background: idx % 2 === 0 ? '#f8f5fd' : '#eaf6ffbb'
              }}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, minWidth: 90, fontWeight: 500 }}>{m.name}</td>
                <td style={tdStyle}>{toDollars(m.due)}</td>
                <td style={tdStyle}>{m.dueDate}</td>
                <td style={tdStyle}>{toDollars(calcPaid(m.payments))}</td>
                <td style={{
                  ...tdStyle,
                  color: balance > 0 ? '#d0006e' : '#1a9d32',
                  fontWeight: 700,
                }}>
                  {toDollars(balance)}
                </td>
                {isAdmin && (
                  <td style={{ ...tdStyle, minWidth: 140 }}>
                    <button
                      className="btn"
                      style={btnStyle(accent, '#fff', { padding: '4px 11px', fontSize: 14 })}
                      onClick={() => onEdit(m)}
                    >Edit</button>
                    <button
                      className="btn"
                      style={btnStyle('#e70aeb', '#fff', { marginLeft: 7, padding: '4px 11px', fontSize: 14 })}
                      onClick={() => onRecordPayment(m)}
                    >Record Payment</button>
                    <button
                      className="btn"
                      style={btnStyle('#ebe91c', '#720c88', { marginLeft: 7, padding: '4px 11px', fontSize: 14 })}
                      onClick={() => onDelete(m.id)}
                    >Remove</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '14px 10px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: 16,
};

const tdStyle = {
  padding: '11px 10px',
  textAlign: 'left',
  background: 'inherit',
  fontSize: 16,
  verticalAlign: 'middle',
};

// === ADD/EDIT MEMBER DIALOG ===
function MemberEditDialog({ initialMember, onSave, onCancel, accent }) {
  const [name, setName] = useState(initialMember?.name || '');
  const [due, setDue] = useState(initialMember?.due || DEFAULT_DUES);
  const [dueDate, setDueDate] = useState(initialMember?.dueDate || '2024-08-15');

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !due || !dueDate) return;
    onSave({ name, due: Number(due), dueDate });
  }

  return (
    <Modal>
      <form
        style={{
          minWidth: 320, maxWidth: 370, background: '#fff',
          borderRadius: 13, boxShadow: '0 2px 14px #e70aeb21',
          padding: '29px 22px', margin: '70px auto', fontSize: 17,
          display: 'flex', flexDirection: 'column', gap: 17, alignItems: 'stretch'
        }}
        onSubmit={handleSubmit}
      >
        <div style={{ fontWeight: 800, color: accent, fontSize: 23, marginBottom: 9 }}>
          {initialMember ? 'Edit Member' : 'Add New Member'}
        </div>
        <label>
          Name:
          <input
            type="text"
            autoFocus
            value={name}
            required
            maxLength={60}
            style={inputStyle}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Luna Spark"
          />
        </label>
        <label>
          Dues Amount ($):
          <input
            type="number"
            min={0}
            max={10000}
            required
            value={due}
            style={inputStyle}
            onChange={e => setDue(e.target.value)}
          />
        </label>
        <label>
          Due Date:
          <input
            type="date"
            required
            value={dueDate}
            style={inputStyle}
            onChange={e => setDueDate(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', gap: 12, marginTop: 9 }}>
          <button type="submit"
            className="btn"
            style={btnStyle(accent, '#fff', { flex: 1 })}>
            {initialMember ? 'Save Changes' : 'Add Member'}
          </button>
          <button type="button"
            className="btn"
            style={btnStyle('#dedede', '#7b078a', { flex: 1 })}
            onClick={onCancel}
          >Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// === RECORD PAYMENT DIALOG ===
function PaymentDialog({ member, onSave, onCancel, accent, warning }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  if (!member) return null;

  // PUBLIC_INTERFACE
  function handlePay(e) {
    e.preventDefault();
    if (!amount || !date) return;
    if (Number(amount) > calcBalance(member.due, member.payments)) {
      alert('Cannot pay more than outstanding balance!');
      return;
    }
    onSave({ memberId: member.id, amount: Number(amount), date });
  }

  const outstanding = calcBalance(member.due, member.payments);

  return (
    <Modal>
      <form
        style={{
          minWidth: 290, maxWidth: 370, background: '#fff',
          borderRadius: 13, boxShadow: '0 2px 17px #e70aeb25',
          padding: '29px 22px', margin: '70px auto', fontSize: 17,
          display: 'flex', flexDirection: 'column', gap: 17, alignItems: 'stretch'
        }}
        onSubmit={handlePay}
      >
        <div style={{ fontWeight: 800, color: accent, fontSize: 21, marginBottom: 6 }}>
          Record Payment for <span style={{ color: warning }}>{member.name}</span>
        </div>
        <div>
          <span>Outstanding Balance: </span>
          <span style={{ color: '#c21b3d', fontWeight: 700 }}>{toDollars(outstanding)}</span>
        </div>
        <label>
          Amount ($):
          <input
            type="number"
            min={1}
            max={outstanding}
            required
            value={amount}
            style={inputStyle}
            onChange={e => setAmount(e.target.value)}
          />
        </label>
        <label>
          Payment Date:
          <input
            type="date"
            required
            value={date}
            style={inputStyle}
            onChange={e => setDate(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 9 }}>
          <button type="submit"
            className="btn"
            style={btnStyle(accent, '#fff', { flex: 1 })}>
            Record
          </button>
          <button type="button"
            className="btn"
            style={btnStyle('#dedede', '#7b078a', { flex: 1 })}
            onClick={onCancel}
          >Cancel</button>
        </div>
      </form>
    </Modal>
  );
}


// === SET WHOLE CAMP DUES FORM ===
function SetCampDuesForm({ onSet, accent, secondary }) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // PUBLIC_INTERFACE
  function submit(e) {
    e.preventDefault();
    if (!amount || !dueDate) return;
    onSet(Number(amount), dueDate);
    setAmount('');
    setDueDate('');
  }
  return (
    <form onSubmit={submit} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#f5e6fd',
      padding: '8px 17px',
      borderRadius: 9,
      boxShadow: '0 1px 6px #e70aeb12',
      marginLeft: 11,
    }}>
      <input
        type="number"
        min={0}
        max={10000}
        placeholder="Dues $"
        value={amount}
        required
        style={{ ...inputStyle, width: 80 }}
        onChange={e => setAmount(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        required
        style={{ ...inputStyle, width: 140 }}
        onChange={e => setDueDate(e.target.value)}
      />
      <button
        className="btn"
        style={btnStyle(accent, secondary)}
        type="submit"
      >Set Dues for All</button>
    </form>
  );
}

// === MEMBER LOGIN/SELECTor ===
function MemberLoginSelector({ members, setMemberViewId, accent }) {
  const [search, setSearch] = useState('');
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{
      maxWidth: 400, background: '#fff', marginTop: 16,
      borderRadius: 12, padding: '24px 30px', boxShadow: '0 2px 16px #e70aeb0a'
    }}>
      <div style={{ marginBottom: 8, fontWeight: 700, color: accent, fontSize: 19 }}>
        Choose your name:
      </div>
      <input
        style={{ ...inputStyle, marginBottom: 10, width: '100%' }}
        placeholder="Type to search your name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: 240, overflow: 'auto', margin: 0 }}>
        {filtered.length === 0 && <li style={{ opacity: 0.6, padding: '8px 0' }}>No member found.</li>}
        {filtered.map(m => (
          <li key={m.id}>
            <button style={{
              ...btnStyle(accent, '#fff', {
                width: '100%',
                marginBottom: 7,
                padding: '8px 15px',
                fontSize: 16,
                borderRadius: 8,
                fontWeight: 600,
                textAlign: 'left'
              }),
              border: '1.5px solid #e70aeb55'
            }} onClick={() => setMemberViewId(m.id)}>
              {m.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// === MEMBER INFO ===
function MemberInfoView({ member, close }) {
  if (!member) return null;
  const balance = calcBalance(member.due, member.payments);
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 14px #1dcffc19',
      padding: '28px 32px',
      maxWidth: 485,
      margin: '32px auto',
      textAlign: 'center',
      color: '#232323'
    }}>
      <div style={{ fontWeight: 700, fontSize: 26, color: '#e70aeb', marginBottom: 6 }}>
        {member.name}
      </div>
      <div style={{ margin: '9px 0', fontWeight: 500 }}>
        <span style={{ color: '#243dff' }}>Amount Due:</span> <span style={{ fontWeight: 800 }}>{toDollars(member.due)}</span>
      </div>
      <div style={{ margin: '11px 0', fontWeight: 500 }}>
        <span style={{ color: '#e70aeb' }}>Due Date:</span> <span style={{ fontWeight: 700 }}>{member.dueDate}</span>
      </div>
      <div style={{ margin: '13px 0', fontWeight: 500 }}>
        <span style={{ color: balance > 0 ? '#c21b3d' : '#36e68f' }}>Outstanding Balance:</span>{' '}
        <span style={{
          fontWeight: 900,
          color: balance > 0 ? '#c21b3d' : '#36e68f'
        }}>{toDollars(balance)}</span>
      </div>
      <div style={{ margin: '18px 0 0 0', textAlign: 'left' }}>
        <div style={{ color: '#1dcffc', fontWeight: 600, fontSize: 19, marginBottom: 6 }}>Payment History:</div>
        {member.payments.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic' }}>No payments yet</div>
        ) : (
          <table style={{ width: '100%', fontSize: 15 }}>
            <thead>
              <tr style={{ color: '#243dff', background: '#eaf7ff' }}>
                <th style={{ ...thStyle, fontSize: 15 }}>Amount</th>
                <th style={{ ...thStyle, fontSize: 15 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {member.payments.map((p, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{toDollars(p.amount)}</td>
                  <td style={tdStyle}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <button
          className="btn"
          style={btnStyle('#243dff', '#fff', { marginTop: 20 })}
          onClick={close}
        >Back</button>
      </div>
    </div>
  );
}

// === MODAL GENERIC ===
function Modal({ children }) {
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, top: 0, bottom: 0,
      background: 'rgba(36,61,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadein 0.2s'
    }}>
      {children}
    </div>
  );
}

// === FESTIVE SPARKLE FOOTER ===
function FestiveSparkle({ amount = 5 }) {
  const emojis = ['🔥', '🎉', '💃', '🦄', '🌈', '🥳', '✨', '🎇'];
  return (
    <span style={{}}>
      {Array(amount).fill().map((_, i) => (
        <span key={i} style={{
          fontSize: 25 + Math.random() * 12,
          margin: '0 3px',
          verticalAlign: 'middle'
        }}>{emojis[i % emojis.length]}</span>
      ))}
    </span>
  );
}

// === UI UTIL STYLES ===
function btnStyle(bg, color, extra = {}) {
  return {
    background: bg,
    color: color,
    border: 'none',
    borderRadius: '7px',
    fontWeight: '600',
    fontSize: 16,
    padding: '7px 18px',
    lineHeight: 1.2,
    boxShadow: `0 1.5px 5px #e70aeb14`,
    cursor: 'pointer',
    ...extra,
  };
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '5px',
  border: '1.5px solid #e70aeb55',
  fontSize: 16,
  marginTop: 2,
  background: '#f5f7fa',
  color: '#232323',
};

export default App;
