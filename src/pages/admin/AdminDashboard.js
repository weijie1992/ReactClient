import React from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";

const AdminDashboard = () => {
    return (<div className="row">
            <div className="col-md-2">
            <AdminSideBar/>
            </div>
            <div className="col-md-10">
            This is admin dashboard page will display all recent orders
            </div>
        </div>);
}

export default AdminDashboard;