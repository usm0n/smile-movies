import React from "react";
import logo from "../../assets/images/logo.png";

function index() {
  return (
    <div className="admin-index">
      <img className="admin-index-img" src={logo} alt="" />
      <div className="admin-index-texts">
        <h1 className="admin-index-texts-title">This is Admin Panel</h1>
        <p className="admin-index-texts-desc">
          You are admin so you can customize movies, users and you can also add
          new admins and more...
        </p>
      </div>
    </div>
  );
}

export default index;
