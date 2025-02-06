import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';

const RoleManagement = () => {
  const availablePages = [
    'Dashboard',
    'Inventory',
    'PCS Management',
    'Bag Management',
    'Reports',
    'User Management',
    'Settings'
  ];

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      username: 'admin',
      role: 'Admin',
      accessiblePages: availablePages,
    }
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', permissions: ['Full Access'], description: 'Complete system access' },
    { id: 2, name: 'Manager', permissions: ['Read', 'Write'], description: 'Departmental access' },
    { id: 3, name: 'Operator', permissions: ['Read'], description: 'Basic access' }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: '',
    accessiblePages: []
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const userId = users.length + 1;
    setUsers([...users, { ...newUser, id: userId }]);
    setNewUser({
      name: '',
      username: '',
      password: '',
      role: '',
      accessiblePages: []
    });
    setShowAddUser(false);
  };

  const handlePageAccessToggle = (page) => {
    const updatedPages = newUser.accessiblePages.includes(page)
      ? newUser.accessiblePages.filter(p => p !== page)
      : [...newUser.accessiblePages, page];
    
    setNewUser({
      ...newUser,
      accessiblePages: updatedPages
    });
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditUser(true);
  };

  const handleSaveEdit = () => {
    setUsers(users.map(user => 
      user.id === currentUser.id ? currentUser : user
    ));
    setShowEditUser(false);
    setCurrentUser(null);
  };

  return (
    <div className="main-content p-6">
      <Card>
        <CardHeader>
          <CardTitle>User & Role Management</CardTitle>
          <Button 
            onClick={() => setShowAddUser(true)}
            className="mt-2"
          >
            Add New User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Add New User Form */}
          {showAddUser && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <Input
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <Select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="max-w-md"
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Access</label>
                  <div className="space-y-2">
                    {availablePages.map(page => (
                      <div key={page} className="flex items-center">
                        <Checkbox
                          id={`page-${page}`}
                          checked={newUser.accessiblePages.includes(page)}
                          onCheckedChange={() => handlePageAccessToggle(page)}
                        />
                        <label htmlFor={`page-${page}`} className="ml-2">
                          {page}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit">Add User</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Edit User Form */}
          {showEditUser && currentUser && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <Select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                    className="max-w-md"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Access</label>
                  <div className="space-y-2">
                    {availablePages.map(page => (
                      <div key={page} className="flex items-center">
                        <Checkbox
                          id={`edit-page-${page}`}
                          checked={currentUser.accessiblePages.includes(page)}
                          onCheckedChange={() => {
                            const updatedPages = currentUser.accessiblePages.includes(page)
                              ? currentUser.accessiblePages.filter(p => p !== page)
                              : [...currentUser.accessiblePages, page];
                            setCurrentUser({ ...currentUser, accessiblePages: updatedPages });
                          }}
                        />
                        <label htmlFor={`edit-page-${page}`} className="ml-2">
                          {page}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => setShowEditUser(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Accessible Pages</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.accessiblePages.join(', ')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditUser(user)}>Edit</Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'Admin'}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;