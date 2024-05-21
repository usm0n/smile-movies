import React from "react";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { useAllUsers } from "../../../contexts/Users";

function AllUsers() {
  const { allUsers } = useAllUsers();
  const apiRef = useGridApiRef();
  const columns = [
    { field: "_id", headerName: "ID", width: 70 },
    { field: "firstname", headerName: "First Name", width: 100 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "isPremiumUser", headerName: "isPremium", width: 100 },
    { field: "isAdmin", headerName: "isAdmin", width: 100 },
    { field: "isVerified", headerName: "isVerified", width: 100 },
    { field: "isBanned", headerName: "isBanned", width: 100 },
    { field: "isBlocked", headerName: "isBlocked", width: 100 },
  ];

  return (
    <div className="admin-users">
      <div className="admin-users-content">
        <h1>All Users: {allUsers.users.length}</h1>
        <h1>
          Verified Users: {allUsers.users.filter((m) => m.isVerified).length}
        </h1>
        <h1>
          Premium Users: {allUsers.users.filter((m) => m.isPremiumUser).length}
        </h1>
        <h1>Admins: {allUsers.users.filter((m) => m.isAdmin).length}</h1>
      </div>
      <DataGrid
        sx={{
          background: "#fff",
        }}
        getRowId={(row) => row._id}
        rows={allUsers.users}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 20]}
      />
    </div>
  );
}

export default AllUsers;
