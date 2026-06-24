import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const API_URL = "https://ems-backend-nfo8.onrender.com/employees";

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ name: "", department: "", salary: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getEmployees = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setEmployees(data);
  };

  useEffect(() => { getEmployees(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditingId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setFormData({ name: "", department: "", salary: "" });
    setIsFormOpen(false);
    getEmployees();
  };

  const deleteEmployee = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    getEmployees();
  };

  const editEmployee = (employee) => {
    setEditingId(employee.id);
    setFormData({ name: employee.name, department: employee.department, salary: employee.salary });
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData({ name: "", department: "", salary: "" });
    setIsFormOpen(false);
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map((emp) => emp.department))];

  const avgSalary = employees.length
    ? Math.round(employees.reduce((s, e) => s + Number(e.salary), 0) / employees.length)
    : 0;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">PeopleDesk</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">▦</span> Employees
          </div>
          <div className="nav-item">
            <span className="nav-icon">◈</span> Departments
          </div>
          <div className="nav-item">
            <span className="nav-icon">◎</span> Analytics
          </div>
          <div className="nav-item">
            <span className="nav-icon">⊙</span> Settings
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-badge">
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin</div>
              <div className="admin-role">HR Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <header className="topbar">
          <div>
            <h1 className="page-title">Employee Directory</h1>
            <p className="page-sub">Manage your workforce with ease</p>
          </div>
          <button className="add-btn" onClick={() => { cancelForm(); setIsFormOpen(true); }}>
            <span>＋</span> Add Employee
          </button>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{employees.length}</div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-bar" style={{ "--fill": "70%" }}></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{departments.length}</div>
            <div className="stat-label">Departments</div>
            <div className="stat-bar" style={{ "--fill": "45%" }}></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{avgSalary.toLocaleString()}</div>
            <div className="stat-label">Avg. Salary</div>
            <div className="stat-bar" style={{ "--fill": "60%" }}></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filteredEmployees.length}</div>
            <div className="stat-label">Showing Now</div>
            <div className="stat-bar" style={{ "--fill": `${employees.length ? (filteredEmployees.length / employees.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="modal-overlay" onClick={cancelForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? "Edit Employee" : "New Employee"}</h2>
                <button className="modal-close" onClick={cancelForm}>✕</button>
              </div>
              <form onSubmit={addEmployee} className="modal-form">
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Salary (₹)</label>
                  <input
                    type="number"
                    name="salary"
                    placeholder="e.g. 85000"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={cancelForm}>Cancel</button>
                  <button type="submit" className="btn-submit">
                    {editingId ? "Save Changes" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <h3>No employees found</h3>
            <p>Try adjusting your filters or add a new employee.</p>
          </div>
        ) : (
          <div className="employee-grid">
            {filteredEmployees.map((employee) => (
              <div className="card" key={employee.id}>
                <div className="card-shine"></div>
                <div className="card-avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="card-name">{employee.name}</h3>
                <span className="dept-pill">{employee.department}</span>
                <div className="card-salary">₹{Number(employee.salary).toLocaleString()}</div>
                <div className="salary-label">Annual Salary</div>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => editEmployee(employee)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteEmployee(employee.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;