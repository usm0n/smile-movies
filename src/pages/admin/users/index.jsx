import React from "react";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { useAllUsers } from "../../../contexts/Users";

function index() {
  const { allUsers } = useAllUsers();
  const apiRef = useGridApiRef();
  const columns = [
    { field: "_id", headerName: "ID", width: 70 },
    { field: "firstname", headerName: "First Name", width: 100 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "isPremiumUser", headerName: "isPremium", width: 70 },
    { field: "isAdmin", headerName: "isAdmin", width: 70 },
    { field: "isVerified", headerName: "isVerified", width: 70 },
    { field: "isBanned", headerName: "isBanned", width: 70 },
    { field: "isBlocked", headerName: "isBlocked", width: 70 },
  ];

  return (
    <div className="admin-users">
      <DataGrid
        getRowId={(row) => row._id}
        rows={allUsers.users}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 20]}
        checkboxSelection
      />
    </div>
  );
}

export default index;
