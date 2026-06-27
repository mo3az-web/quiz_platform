import React, { useEffect, useState } from "react";
import type { User } from "../types/types";
import api from "../Api/api";
import { useNavigate } from "react-router-dom";

const UsersPage: React.FC = () => {
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

const fetchUsers = async () => {
try {
const response = await api.get("/admin/users");


  
  const filteredUsers = response.data.data.filter(
    (user: User) => user.role !== "admin"
  );

  setUsers(filteredUsers);
} catch (error) {
  console.error("Error fetching users", error);
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchUsers();
}, []);

if (loading)
return ( <div className="flex justify-center items-center h-screen text-lg font-semibold">
Loading... </div>
);

return ( <div className="p-6 bg-gray-100 min-h-screen"> <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">

```
    <h2 className="text-2xl font-bold mb-6 text-gray-800">
      Students List
    </h2>

    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              onClick={() => navigate(`/users/${user.id}`)} // 🚀 هنا النافيجيشن
              className={`cursor-pointer border-b ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-blue-50 transition`}
            >
              <td className="p-3">{user.id}</td>
              <td className="p-3 font-medium text-gray-700">
                {user.name}
              </td>
              <td className="p-3 text-gray-600">
                {user.email}
              </td>
              <td className="p-3">
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </div>
</div>


);
};

export default UsersPage;
